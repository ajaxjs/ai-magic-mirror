import { ref } from 'vue'
import OpenWake from '../lib/OpenWake.js'
import { useChatStore } from '../stores/chatStore.js'


let wake = null;
export const useAwake = async () => {

    const chatStore = useChatStore()
    // 初始化唤醒模型
    if (!wake) {
        wake = new OpenWake();
        wake.on('ready', () => {
            console.log('✅ 模型已初始化');
            chatStore.isReady = true;
        });
        wake.on('start', () => {
            console.log('✅ 监听已启动');
            chatStore.isInit = true;
        });
        // 监听唤醒事件
        wake.on('awake', (event) => {
            console.log('唤醒事件:', event);
            chatStore.isWake = true;
        });
        // 监听休眠事件
        wake.on('sleep', () => {
            console.log('💤 已休眠');
            chatStore.isWake = false;
        });
        // 监听说话开始事件
        wake.on('speechStart', () => {
            console.log('😁说话开始');
            chatStore.isSpeaking = true;
        });
        // 监听说话结束事件
        wake.on('speechEnd', () => {
            console.log('🤐说话结束');
            chatStore.isSpeaking = false;
        });
        // 监听完整语音段事件
        wake.on('utterance', audio => {
            console.log('完整语音段长度：', audio.length)
        });

        await wake.init({
            alexa: 'models/alexa_v0.1.onnx',
            hey_jarvis: 'models/hey_jarvis_v0.1.onnx',
            // hey_mycroft: 'models/hey_mycroft_v0.1.onnx',
            // hey_rhasspy: 'models/hey_rhasspy_v0.1.onnx'
        });
        await wake.start();
    }


    return { wake, chatStore };
}

export default {
    install(app) {
        app.config.globalProperties.$wake = useAwake()
    }
}