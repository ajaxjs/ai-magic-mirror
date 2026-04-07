// import OpenWake from './OpenWake.js'
import OpenWake from './OpenWake.js'

export async function useWakeMonitor() {

    const wake = new OpenWake();
    // 初始化模型
    await wake.init({
        alexa: 'models/alexa_v0.1.onnx',
        // hey_mycroft: 'models/hey_mycroft_v0.1.onnx',
        // hey_jarvis: 'models/hey_jarvis_v0.1.onnx',
        // hey_rhasspy: 'models/hey_rhasspy_v0.1.onnx'
    });

    //wake.on('ready', e => console.log('ready', e));
    //wake.on('score', e => console.log(e));
    //wake.on('vad', v => console.log('VAD:', v));
    //wake.on('speech', () => console.log('speech'));
    wake.on('speechStart', () => console.log('speechStart'));
    wake.on('speechEnd', () => console.log('speechEnd'));
    wake.on('detect', e => console.log('唤醒:', e));

    await wake.start();

    return wake;

}
