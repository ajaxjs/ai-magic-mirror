importScripts('/onnxruntime-web/ort.wasm.min.js');

// 配置 WASM 环境
ort.env.wasm.wasmPaths = '/onnxruntime-web/';
ort.env.wasm.numThreads = 1; // 优化：启用多线程，提升推理速度

let ctx = {
    sampleRate: 16000,
    frameSize: 1280,
    models: {},
    melRing: null,
    melStart: 0,
    melCount: 0,
    MEL_RING_SIZE: 120,
    embBuffer: null,
    embStart: 0,
    EMB_SIZE: 16,
    EMB_DIM: 96,
    vadState: { h: null, c: null },
    isSpeechActive: false,
    utteranceBuffer: [],
    vadHangoverCounter: 0,
    VAD_HANGOVER_FRAMES: 12,
    isCoolingDown: false,   // 是否正在冷却中
    isAwake: false, // 是否被唤醒
    awakeTime: 5000, // 唤醒超时时间
    chatNumber: 0, // 会话编号
};

// 唤醒定时器
let awakeTimer = null;

self.onmessage = async (e) => {
    const { type, data } = e.data;
    try {
        switch (type) {
            case 'init':
                await init(data);
                break;
            case 'chunk':
                await processChunk(data);
                break;
        }
    } catch (err) {
        postMessage({ type: 'error', data: String(err) });
    }
};

async function init(config) {
    const opt = { executionProviders: ['wasm'] };
    // 1. 加载 Mel 频谱转换模型
    ctx.melspecModel = await ort.InferenceSession.create('models/melspectrogram.onnx', opt);
    // 2. 加载 Embedding 提取模型（把 Mel 特征转为 Embedding 向量）
    ctx.embeddingModel = await ort.InferenceSession.create('models/embedding_model.onnx', opt);
    // 3. 加载 Silero VAD 语音活动检测模型
    ctx.vadModel = await ort.InferenceSession.create('models/silero_vad.onnx', opt);
    // 4. 加载用户自定义的唤醒词模型（支持多个，例如 alexa）
    for (const name in config.models) {
        ctx.models[name] = {
            session: await ort.InferenceSession.create(config.models[name], opt),
            scores: new Array(50).fill(0)
        };
    }

    // 初始化所有运行时缓冲区和状态
    resetState();
    // 通知主线程：Worker 初始化完成
    postMessage({ type: 'ready' });
}

function resetState() {
    ctx.melRing = new Array(ctx.MEL_RING_SIZE);
    ctx.melStart = 0;
    ctx.melCount = 0;

    ctx.embBuffer = Array.from({ length: ctx.EMB_SIZE }, () => new Float32Array(ctx.EMB_DIM));
    ctx.embStart = 0;

    const shape = [2, 1, 64];
    ctx.vadState.h = new ort.Tensor('float32', new Float32Array(128), shape);
    ctx.vadState.c = new ort.Tensor('float32', new Float32Array(128), shape);

    ctx.isSpeechActive = false;
    ctx.utteranceBuffer = [];
    ctx.vadHangoverCounter = 0;
    ctx.isCoolingDown = false;
}

async function processChunk(chunk) {
    const vad = await runVad(chunk);
    postMessage({ type: 'vad', data: vad });

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

    // 边沿检测
    if (!prevSpeech && ctx.isSpeechActive && ctx.isAwake) {
        ctx.utteranceBuffer = [];
        postMessage({ type: 'speechStart' });
        // 开始说话-清除休眠定时器
        clearTimeout(awakeTimer);
    }

    if (ctx.isSpeechActive && ctx.isAwake) {
        ctx.utteranceBuffer.push(new Float32Array(chunk));
        postMessage({ type: 'speech' });
    }

    if (prevSpeech && !ctx.isSpeechActive && ctx.isAwake) {
        postMessage({ type: 'speechEnd' });
        // 说话结束-设置休眠定时器
        awakeTimer = setTimeout(() => {
            ctx.isAwake = false;
            // 休眠后重置会话编号
            ctx.chatNumber = 0;
            postMessage({ type: 'sleep' });
        }, ctx.awakeTime);

        // 拼接完整 utterance (唤醒词不发送)
        const totalLength = ctx.utteranceBuffer.reduce((sum, c) => sum + c.length, 0);
        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const c of ctx.utteranceBuffer) {
            merged.set(c, offset);
            offset += c.length;
        }
        postMessage({
            type: 'utterance',
            data: {
                data: merged,
                index: ctx.chatNumber
            }
        });
        ctx.utteranceBuffer = [];
        // 会话编号增加
        ctx.chatNumber += 1;
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

    // 归一化（模型特定）
    for (let i = 0; i < mel.length; i++) {
        mel[i] = mel[i] / 10 + 2;
    }

    // 每 chunk 产生 5 个 mel 帧 → 环形缓冲区
    for (let i = 0; i < 5; i++) {
        const frame = new Float32Array(mel.subarray(i * 32, (i + 1) * 32));
        const ringIdx = (ctx.melStart + ctx.melCount) % ctx.MEL_RING_SIZE;
        ctx.melRing[ringIdx] = frame;
        ctx.melCount++;
    }

    // 滑动窗口推理
    while (ctx.melCount >= 76) {
        const flat = new Float32Array(76 * 32);
        for (let i = 0; i < 76; i++) {
            const ringIdx = (ctx.melStart + i) % ctx.MEL_RING_SIZE;
            flat.set(ctx.melRing[ringIdx], i * 32);
        }

        const embOut = await ctx.embeddingModel.run({
            [ctx.embeddingModel.inputNames[0]]: new ort.Tensor('float32', flat, [1, 76, 32, 1])
        });

        const emb = embOut[ctx.embeddingModel.outputNames[0]].data;

        // === 环形缓冲区更新 Embedding（关键优化：零新数组分配）===
        const writePos = ctx.embStart;
        ctx.embStart = (ctx.embStart + 1) % ctx.EMB_SIZE;
        ctx.embBuffer[writePos].set(emb); // 复用已分配的 Float32Array

        // 构建 classifier 输入
        const finalInput = new Float32Array(ctx.EMB_SIZE * ctx.EMB_DIM);
        for (let i = 0; i < ctx.EMB_SIZE; i++) {
            const idx = (ctx.embStart + i) % ctx.EMB_SIZE;
            finalInput.set(ctx.embBuffer[idx], i * ctx.EMB_DIM);
        }

        await runClassifier(finalInput);

        // 滑动窗口，丢弃前 8 帧
        ctx.melStart = (ctx.melStart + 8) % ctx.MEL_RING_SIZE;
        ctx.melCount -= 8;
    }
}

async function runClassifier(input) {
    const tensor = new ort.Tensor('float32', input, [1, 16, 96]);

    // 并行跑所有模型
    const results = await Promise.all(
        Object.entries(ctx.models).map(async ([name, m]) => {
            const res = await m.session.run({
                [m.session.inputNames[0]]: tensor
            });

            const score = res[m.session.outputNames[0]].data[0];

            // 发送实时分数（不影响主逻辑）
            postMessage({ type: 'score', data: { name, score } });

            return { name, score };
        })
    );

    // 找最高分模型（避免并发触发）
    let best = null;
    for (const r of results) {
        if (!best || r.score > best.score) {
            best = r;
        }
    }

    // =========================
    // ✅ 触发逻辑（带防抖）
    // =========================
    if (
        best &&
        best.score > 0.5 &&
        ctx.isSpeechActive &&
        !ctx.isCoolingDown
    ) {
        ctx.isCoolingDown = true;
        ctx.isAwake = true;

        postMessage({
            type: 'awake',
            data: best
        });

        // 防抖（冷却时间）
        setTimeout(() => {
            ctx.isCoolingDown = false;
        }, 2000);
    }
}

