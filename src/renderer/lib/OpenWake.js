import mitt from 'mitt';

/**
 *  唤醒词识别 (Worker版) - 优化后版本
 * 
 *  使用示例完全不变：
    const wake = new OpenWake();
    wake.on('ready', () => console.log('✅ 模型已初始化'));
    wake.on('start', () => console.log('✅ 监听已启动'));
    wake.on('score', e => console.log('模型得分:', e));
    wake.on('vad', v => console.log('VAD:', v));
    wake.on('speech', () => console.log('speech'));
    wake.on('awake', (data) => console.log('✅ 已唤醒', data));
    wake.on('sleep', () => console.log('💤 已休眠'));

    wake.on('speechStart', () => console.log('😁说话开始'));
    wake.on('speechEnd', () => console.log('🤐说话结束'));
    wake.on('utterance', audio => console.log('完整语音段', audio.length));
    wake.on('error', err => console.error('❌ 错误:', err));
    // 初始化模型
    await wake.init({
        alexa: 'models/alexa_v0.1.onnx',
        hey_jarvis: 'models/hey_jarvis_v0.1.onnx',
        // hey_mycroft: 'models/hey_mycroft_v0.1.onnx',
        // hey_rhasspy: 'models/hey_rhasspy_v0.1.onnx'
    });
    await wake.start();

 */

export default class OpenWake {
    /** 静态缓存 AudioWorklet Blob URL，全局只创建一次 */
    static _workletUrl = null;

    constructor(options = {}) {
        this.emitter = mitt();
        this.options = {
            workerPath: './openwake.worker.js',
            ...options
        };

        this.worker = new Worker(this.options.workerPath);
        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            this.emitter.emit(type, data);
        };

        this.isRunning = false;
        this.stream = null;
        this.audioContext = null;
        this.source = null;
        this.node = null;
    }

    on(type, fn) {
        this.emitter.on(type, fn);
    }

    async init(models) {
        this.worker.postMessage({
            type: 'init',
            data: { models }
        });

        return new Promise((resolve, reject) => {
            let resolved = false;

            const onReady = () => {
                if (resolved) return;
                resolved = true;
                this.emitter.off('ready', onReady);
                this.emitter.off('error', onError);
                resolve();
            };

            const onError = (err) => {
                if (resolved) return;
                resolved = true;
                this.emitter.off('ready', onReady);
                this.emitter.off('error', onError);
                reject(new Error(err || 'Worker init failed'));
            };

            this.on('ready', onReady);
            this.on('error', onError);
        });
    }

    async start() {
        if (this.isRunning) {
            console.warn('[OpenWake] already running');
            return;
        }

        this.isRunning = true;

        // 优化：强制 16kHz 单声道 + 关闭不必要的音频处理
        this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                sampleRate: 16000,
                channelCount: 1,
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });

        this.audioContext = new AudioContext({ sampleRate: 16000 });
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.source = source;

        // 静态缓存 AudioWorklet，只创建一次
        if (!OpenWake._workletUrl) {
            const processor = `
                class P extends AudioWorkletProcessor {
                    buffer = new Float32Array(1280);
                    pos = 0;
                    process(inputs) {
                        const input = inputs[0][0];
                        if (input) {
                            for (let i = 0; i < input.length; i++) {
                                this.buffer[this.pos++] = input[i];
                                if (this.pos === 1280) {
                                    this.port.postMessage(this.buffer);
                                    this.pos = 0;
                                }
                            }
                        }
                        return true;
                    }
                }
                registerProcessor('p', P);
            `;
            const blob = new Blob([processor], { type: 'application/javascript' });
            OpenWake._workletUrl = URL.createObjectURL(blob);
        }

        await this.audioContext.audioWorklet.addModule(OpenWake._workletUrl);

        this.node = new AudioWorkletNode(this.audioContext, 'p');

        this.node.port.onmessage = (e) => {
            this.worker.postMessage({
                type: 'chunk',
                data: e.data
            });
        };

        source.connect(this.node);
        // 开始监听
        this.emitter.emit('start');
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;

        this.stream?.getTracks().forEach(t => t.stop());
        this.source?.disconnect();
        this.node?.disconnect();

        this.audioContext?.close().catch(() => {});
        
        this.stream = null;
        this.source = null;
        this.node = null;
        this.audioContext = null;
    }
}