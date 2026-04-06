// import OpenWake from './OpenWake.js'
import OpenWake from './OpenWake.js'

export async function useWakeMonitor() {

    const wake = new OpenWake();
    // 初始化模型
    await wake.init({
        alexa: 'models/alexa_v0.1.onnx'
    });

    //wake.on('ready', e => console.log('ready', e));
    //wake.on('score', e => console.log(e));
    //wake.on('vad', v => console.log('VAD:', v));
    wake.on('speechEnd', v => console.log('speechEnd:', v));
    wake.on('detect', e => console.log('唤醒:', e));

    await wake.start();

    return wake;

}
