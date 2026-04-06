import mitt from 'mitt';

/**
 *  唤醒词识别(Worker版)
 *  - 初始化模型
    await wake2.init({
        alexa: 'models/alexa_v0.1.onnx'
    });
    - 图表展示
    wake2.on('score', e => console.log(e));
    - VAD 事件
    wake2.on('vad', v => console.log('VAD:', v));
    - 唤醒事件
    wake2.on('detect', e => console.log('唤醒:', e));
    - 语音结束事件
    wake2.on('speechEnd', e => console.log('语音结束:', e));

    - 启动识别
    await wake2.start();
 */

export default class OpenWake {
    constructor(options = {}) {
        this.emitter = mitt();

        this.worker = new Worker(options.workerPath || './openwake.worker.js');

        this.worker.onmessage = (e) => {
            const { type, data } = e.data;
            this.emitter.emit(type, data);
        };
    }

    on(type, fn) {
        this.emitter.on(type, fn);
    }

    async init(models) {
        this.worker.postMessage({
            type: 'init',
            data: { models }
        });

        return new Promise((resolve) => {
            this.on('ready', resolve);
        });
    }

    async start() {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        this.audioContext = new AudioContext({ sampleRate: 16000 });
        const source = this.audioContext.createMediaStreamSource(this.stream);

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
        const url = URL.createObjectURL(blob);

        await this.audioContext.audioWorklet.addModule(url);

        this.node = new AudioWorkletNode(this.audioContext, 'p');

        this.node.port.onmessage = (e) => {
            this.worker.postMessage({
                type: 'chunk',
                data: e.data
            });
        };

        source.connect(this.node);
        this.node.connect(this.audioContext.destination);
    }

    stop() {
        this.stream?.getTracks().forEach(t => t.stop());
        this.audioContext?.close();
    }
}