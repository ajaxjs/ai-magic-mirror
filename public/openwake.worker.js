importScripts('/onnxruntime-web/ort.wasm.min.js');
//importScripts('/node_modules/onnxruntime-web/dist/ort.wasm.js');
//importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
//import * as ort from 'node_modules/onnxruntime-web/dist/ort.min.js'

// 配置WASM环境
ort.env.wasm.wasmPaths = '/onnxruntime-web/';
//ort.env.wasm.wasmPaths = '/node_modules/onnxruntime-web/dist/';
//ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
// WASM线程优化
//ort.env.wasm.numThreads = 2;

let ctx = {
    sampleRate: 16000,
    frameSize: 1280,
    models: {},
    mel_buffer: [],
    embedding_buffer: [],
    vadState: { h: null, c: null },
    isSpeechActive: false,
    utteranceBuffer: [],
    vadHangoverCounter: 0,
    VAD_HANGOVER_FRAMES: 12,
    isCoolingDown: false
};

self.onmessage = async (e) => {
    const { type, data } = e.data;

    switch (type) {
        case 'init':
            await init(data);
            break;
        case 'chunk':
            await processChunk(data);
            break;
    }
};

async function init(config) {
    const opt = { executionProviders: ['wasm'] };

    ctx.melspecModel = await ort.InferenceSession.create('models/melspectrogram.onnx', opt);
    ctx.embeddingModel = await ort.InferenceSession.create('models/embedding_model.onnx', opt);
    ctx.vadModel = await ort.InferenceSession.create('models/silero_vad.onnx', opt);

    for (const name in config.models) {
        ctx.models[name] = {
            session: await ort.InferenceSession.create(config.models[name], opt),
            scores: new Array(50).fill(0)
        };
    }

    resetState();

    postMessage({ type: 'ready' });
}

function resetState() {
    ctx.mel_buffer = [];
    ctx.embedding_buffer = Array.from({ length: 16 }, () => new Float32Array(96));

    const shape = [2, 1, 64];
    ctx.vadState.h = new ort.Tensor('float32', new Float32Array(128), shape);
    ctx.vadState.c = new ort.Tensor('float32', new Float32Array(128), shape);
}

async function processChunk(chunk) {
    const vad = await runVad(chunk);
    postMessage({ type: 'vad', data: vad });

    // 记录上一个状态
    const prevSpeech = ctx.isSpeechActive;

    if (vad) {
        ctx.isSpeechActive = true;
        ctx.vadHangoverCounter = ctx.VAD_HANGOVER_FRAMES;
    } else if (ctx.isSpeechActive) {
        ctx.vadHangoverCounter--;
        if (ctx.vadHangoverCounter <= 0) {
            ctx.isSpeechActive = false;
        }
    }

    // 边沿检测（核心）
    if (!prevSpeech && ctx.isSpeechActive) {
        ctx.utteranceBuffer = [];
        postMessage({ type: 'speechStart' });
    }

    // 持续态
    if (ctx.isSpeechActive) {
        // 复制一份新的chunk，并发送给主线程
        ctx.utteranceBuffer.push(new Float32Array(chunk));
        postMessage({ type: 'speech' });
    }
    // 语音结束事件
    if (prevSpeech && !ctx.isSpeechActive) {
        postMessage({ type: 'speechEnd' });
        console.log('speechEnd', ctx.isCoolingDown);
        // 🔥 拼接音频
        const totalLength = ctx.utteranceBuffer.reduce((sum, c) => sum + c.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const c of ctx.utteranceBuffer) {
            merged.set(c, offset);
            offset += c.length;
        }
        // 🚀 发出去 - TODO: 可以在激活后触发utterance事件
        postMessage({ type: 'utterance', data: merged });
        // 清空缓存
        ctx.utteranceBuffer = [];
    }

    await runInference(chunk);
}

async function runVad(chunk) {
    const tensor = new ort.Tensor('float32', chunk, [1, chunk.length]);
    const sr = new ort.Tensor('int64', [BigInt(ctx.sampleRate)], []);

    const res = await ctx.vadModel.run({
        input: tensor,
        sr,
        h: ctx.vadState.h,
        c: ctx.vadState.c
    });

    ctx.vadState.h = res.hn;
    ctx.vadState.c = res.cn;

    return res.output.data[0] > 0.5;
}

async function runInference(chunk) {
    const melTensor = new ort.Tensor('float32', chunk, [1, ctx.frameSize]);

    const melOut = await ctx.melspecModel.run({
        [ctx.melspecModel.inputNames[0]]: melTensor
    });

    let mel = melOut[ctx.melspecModel.outputNames[0]].data;

    for (let i = 0; i < mel.length; i++) {
        mel[i] = mel[i] / 10 + 2;
    }

    for (let i = 0; i < 5; i++) {
        ctx.mel_buffer.push(new Float32Array(mel.subarray(i * 32, (i + 1) * 32)));
    }

    while (ctx.mel_buffer.length >= 76) {
        const flat = new Float32Array(76 * 32);
        ctx.mel_buffer.slice(0, 76).forEach((f, i) => flat.set(f, i * 32));

        const embOut = await ctx.embeddingModel.run({
            [ctx.embeddingModel.inputNames[0]]:
                new ort.Tensor('float32', flat, [1, 76, 32, 1])
        });

        const emb = embOut[ctx.embeddingModel.outputNames[0]].data;

        ctx.embedding_buffer.shift();
        ctx.embedding_buffer.push(new Float32Array(emb));

        const finalInput = new Float32Array(16 * 96);
        ctx.embedding_buffer.forEach((e, i) => finalInput.set(e, i * 96));

        await runClassifier(finalInput);

        ctx.mel_buffer.splice(0, 8);
    }
}

async function runClassifier(input) {
    const tensor = new ort.Tensor('float32', input, [1, 16, 96]);

    for (const name in ctx.models) {
        const m = ctx.models[name];

        const res = await m.session.run({
            [m.session.inputNames[0]]: tensor
        });

        const score = res[m.session.outputNames[0]].data[0];

        postMessage({ type: 'score', data: { name, score } });

        if (score > 0.5 && ctx.isSpeechActive && !ctx.isCoolingDown) {
            ctx.isCoolingDown = true;

            postMessage({ type: 'detect', data: { name, score } });

            setTimeout(() => (ctx.isCoolingDown = false), 2000);
        }
    }
}