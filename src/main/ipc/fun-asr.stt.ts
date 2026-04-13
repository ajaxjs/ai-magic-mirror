import fs from 'fs';
import WebSocket from 'ws';
import path from 'path';

import { randomUUID } from 'crypto';
import { ipcMain } from 'electron/main';
import { app } from 'electron';
import type { IpcMainEvent } from 'electron/main';

console.log('fun-asr.stt.ts loaded');
// 存储WebSocket连接的Map，每个窗口对应一个连接
const connections = new Map();

// IPC通信处理send-voice事件
ipcMain.on('send-voice', async (event: IpcMainEvent, audioData: any) => {
    console.log('收到语音数据，开始识别...', audioData.index);

    // 获取发送事件的窗口ID
    const windowId = event.sender.id;

    try {
        // 如果已有连接，则关闭旧连接
        if (connections.has(windowId)) {
            const oldWs = connections.get(windowId);
            oldWs.close();
            connections.delete(windowId);
        }

        // 创建新的WebSocket连接
        const ws = await createWebSocketConnection(event, audioData);
        connections.set(windowId, ws);

        // 监听窗口关闭事件，清理连接
        event.sender.once('destroyed', () => {
            if (connections.has(windowId)) {
                const ws = connections.get(windowId);
                ws.close();
                connections.delete(windowId);
            }
        });
    } catch (error) {
        console.error('语音识别过程出错:', error);
        event.reply('asr-error', { error: error.message });
    }
});

// 创建WebSocket连接并处理语音识别
async function createWebSocketConnection(event: IpcMainEvent, audioData: any) {
    // 从环境变量获取API密钥
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_API_KEY;
    if (!apiKey) {
        throw new Error('缺少API密钥，请设置DASHSCOPE_API_KEY或ALIBABA_API_KEY环境变量');
    }

    const url = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/'; // WebSocket服务器地址

    // 生成32位随机ID
    const TASK_ID = randomUUID().replace(/-/g, '').slice(0, 32);

    // 创建WebSocket客户端
    const ws = new WebSocket(url, {
        headers: {
            Authorization: `bearer ${apiKey}`
        }
    });

    let taskStarted = false; // 标记任务是否已启动

    // 连接打开时发送run-task指令
    ws.on('open', () => {
        console.log('连接到服务器');
        sendRunTask();
    });

    // 接收消息处理
    ws.on('message', (data) => {
        try {
            // console.log('---收到消息:', data.toString());
            const message = JSON.parse(data.toString());
            switch (message.header.event) {
                case 'task-started':
                    console.log('任务开始');
                    taskStarted = true;
                    sendAudioStream();
                    break;
                case 'result-generated':
                    console.log('-识别结果：', message.payload.output.sentence.text);
                    // 将识别结果返回给前端
                    event.reply('asr-result', {
                        text: message.payload.output.sentence.text,
                        isFinal: message.payload.output.sentence.sentence_end || false,
                        duration: message.payload.usage ? message.payload.usage.duration : null
                    });

                    if (message.payload.usage) {
                        console.log('任务计费时长（秒）：', message.payload.usage.duration);
                    }
                    break;
                case 'task-finished':
                    console.log('任务完成');
                    // 通知前端任务完成
                    event.reply('asr-complete', {});
                    ws.close();
                    break;
                case 'task-failed':
                    console.error('任务失败：', message.header.error_message);
                    // 通知前端任务失败
                    event.reply('asr-error', {
                        error: message.header.error_message,
                        errorCode: message.header.error_code
                    });
                    ws.close();
                    break;
                default:
                    console.log('未知事件：', message.header.event);
            }
        } catch (error) {
            console.error('处理WebSocket消息出错:', error);
        }
    });

    // 如果没有收到task-started事件，关闭连接
    ws.on('close', () => {
        console.log('WebSocket连接已关闭');
        if (!taskStarted) {
            console.error('任务未启动，关闭连接');
        }
        // 清理连接映射
        const windowId = event.sender.id;
        if (connections.has(windowId)) {
            connections.delete(windowId);
        }
    });

    // 发送run-task指令
    function sendRunTask() {
        const runTaskMessage = {
            header: {
                action: 'run-task',
                task_id: TASK_ID,
                streaming: 'duplex'
            },
            payload: {
                task_group: 'audio',
                task: 'asr',
                function: 'recognition',
                model: 'fun-asr-realtime',
                parameters: {
                    sample_rate: 16000,
                    format: 'wav' // 假设传入的是wav格式，可根据实际音频格式调整
                },
                input: {}
            }
        };
        ws.send(JSON.stringify(runTaskMessage));
    }

    // 发送音频流
    function sendAudioStream() {
        // 将传入的音频数据转换为Buffer
        let audioBuffer;
        if (typeof audioData === 'string') {
            // 如果是字符串，假设是文件路径
            audioBuffer = fs.readFileSync(audioData);
        } else if (audioData instanceof Buffer) {
            // 如果已经是Buffer
            audioBuffer = audioData;
        } else if (typeof audioData === 'object' && audioData.data) {
            // 如果是包含data属性的对象，可能是Float32Array或其他类型
            if (audioData.data instanceof Float32Array) {
                // 将Float32Array转换为16位PCM数据
                audioBuffer = float32ArrayToWavBuffer(audioData.data);
            } else if (ArrayBuffer.isView(audioData.data)) {
                // 如果是其他类型的数组视图
                audioBuffer = Buffer.from(audioData.data.buffer);
            } else if (typeof audioData.data === 'object' && audioData.data.constructor.name === 'Float32Array') {
                // 处理Float32Array的另一种情况
                audioBuffer = float32ArrayToWavBuffer(audioData.data);
            } else {
                audioBuffer = Buffer.from(audioData.data);
            }
        } else if (audioData instanceof Float32Array) {
            // 如果直接传递的是Float32Array
            audioBuffer = float32ArrayToWavBuffer(audioData);
        } else {
            throw new Error('不支持的音频数据格式');
        }

        // 分块发送音频数据
        const chunkSize = 1024; // 每次发送1024字节
        let offset = 0;
        
        function sendNextChunk() {
            if (offset < audioBuffer.length) {
                const chunk = audioBuffer.slice(offset, offset + chunkSize);
                ws.send(chunk);
                offset += chunkSize;
                
                // 模拟音频流发送的时间间隔，每100ms发送一次
                setTimeout(sendNextChunk, 100);
            } else {
                // 音频数据发送完毕，发送finish-task指令
                console.log('音频流发送完毕');
                sendFinishTask();
            }
        }
        
        sendNextChunk();
    }

    // 将Float32Array转换为WAV格式的Buffer
    function float32ArrayToWavBuffer(float32Array: Float32Array): Buffer {
        // 将Float32 [-1, 1] 转换为 16位整数 [-32768, 32767]
        const samples = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // 创建WAV文件头 (44字节)
        const wavBuffer = Buffer.alloc(44 + samples.byteLength);
        
        // 写入WAV头部信息
        // RIFF标识符
        wavBuffer.write('RIFF', 0);
        // 文件大小 (总大小 - 8)
        wavBuffer.writeUInt32LE(36 + samples.byteLength, 4);
        // WAVE格式
        wavBuffer.write('WAVE', 8);
        // fmt子块标识符
        wavBuffer.write('fmt ', 12);
        // fmt子块大小
        wavBuffer.writeUInt32LE(16, 16);
        // 音频格式 (1 = PCM)
        wavBuffer.writeUInt16LE(1, 20);
        // 声道数 (1 = 单声道)
        wavBuffer.writeUInt16LE(1, 22);
        // 采样率 (通常为16000或44100)
        wavBuffer.writeUInt32LE(16000, 24);
        // 字节率 = 采样率 * 声道数 * 位深度/8
        wavBuffer.writeUInt32LE(16000 * 2, 28);
        // 块对齐 = 声道数 * 位深度/8
        wavBuffer.writeUInt16LE(2, 32);
        // 位深度
        wavBuffer.writeUInt16LE(16, 34);
        // data子块标识符
        wavBuffer.write('data', 36);
        // data子块大小
        wavBuffer.writeUInt32LE(samples.byteLength, 40);
        
        // 写入音频数据
        Buffer.from(samples.buffer).copy(wavBuffer, 44);

        // 写入文件
        fs.writeFileSync('audio.wav', wavBuffer);
        console.log(`❗音频文件已保存为 audio.wav (大小: ${samples.byteLength} 字节，上线删除)`);
        
        return wavBuffer;
    }

    // 发送finish-task指令
    function sendFinishTask() {
        const finishTaskMessage = {
            header: {
                action: 'finish-task',
                task_id: TASK_ID,
                streaming: 'duplex'
            },
            payload: {
                input: {}
            }
        };
        ws.send(JSON.stringify(finishTaskMessage));
    }

    // 错误处理
    ws.on('error', (error) => {
        console.error('WebSocket错误：', error);
        event.reply('asr-error', { error: error.message });
    });

    return ws;
}