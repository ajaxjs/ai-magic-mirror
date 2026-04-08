// import OpenWake from './OpenWake.js'
import OpenWake from './OpenWake.js'

export async function useWakeMonitor() {

    const wake = new OpenWake();

    
    wake.on('ready', () => console.log('✅ 模型已初始化'));
    wake.on('start', () => console.log('✅ 监听已启动'));
    //wake.on('score', e => console.log('模型得分:', e));
    //wake.on('vad', v => console.log('VAD:', v));
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

    return wake;

}
