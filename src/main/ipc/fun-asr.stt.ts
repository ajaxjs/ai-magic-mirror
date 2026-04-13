const fs = require('fs');
const WS = require('ws');
const path = require('path');
const { randomUUID } = require('crypto');
const { ipcMain } = require('electron/main');

console.log('fun-asr.stt.ts loaded');
ipcMain.on('send-voice', (event, audio) => {
    console.log('send-voice', audio);
})

/*
const apiKey = 'sk-aa008aeccd9b456ea7c405c258347246';
const url = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/'; // WebSocket服务器地址
const audioFile = path.join(__dirname, './', 'ttsmaker-file-2026-4-13-16-28-32.wav');

// 生成32位随机ID
const TASK_ID = randomUUID().replace(/-/g, '').slice(0, 32);

// 创建WebSocket客户端
const ws = new WS(url, {
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
    const message = JSON.parse(data);
    switch (message.header.event) {
        case 'task-started':
            console.log('任务开始');
            taskStarted = true;
            sendAudioStream();
            break;
        case 'result-generated':
            console.log('识别结果：', message.payload.output.sentence.text);
            if (message.payload.usage) {
                console.log('任务计费时长（秒）：', message.payload.usage.duration);
            }
            break;
        case 'task-finished':
            console.log('任务完成');
            ws.close();
            break;
        case 'task-failed':
            console.error('任务失败：', message.header.error_message);
            ws.close();
            break;
        default:
            console.log('未知事件：', message.header.event);
    }
});

// 如果没有收到task-started事件，关闭连接
ws.on('close', () => {
    if (!taskStarted) {
        console.error('任务未启动，关闭连接');
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
                format: 'wav'
            },
            input: {}
        }
    };
    ws.send(JSON.stringify(runTaskMessage));
}

// 发送音频流
function sendAudioStream() {
    const audioStream = fs.createReadStream(audioFile);
    let chunkCount = 0;

    function sendNextChunk() {
        const chunk = audioStream.read();
        if (chunk) {
            ws.send(chunk);
            chunkCount++;
            setTimeout(sendNextChunk, 100); // 每100ms发送一次
        }
    }

    audioStream.on('readable', () => {
        sendNextChunk();
    });

    audioStream.on('end', () => {
        console.log('音频流结束');
        sendFinishTask();
    });

    audioStream.on('error', (err) => {
        console.error('读取音频文件错误：', err);
        ws.close();
    });
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
});
*/