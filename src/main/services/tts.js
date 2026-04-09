import { streamText } from 'ai';
import { createAlibaba } from '@ai-sdk/alibaba';
import OpenAI from "openai";

const openai = new OpenAI(
    {
        apiKey: process.env.ALIBABA_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

export default async function ttsHandle() {
    console.log('TTS start:', process.env.ALIBABA_API_KEY)

    // const completion = await openai.chat.completions.create({
    //     model: "qwen-plus",  //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
    //     messages: [
    //         { role: "system", content: "You are a helpful assistant." },
    //         { role: "user", content: "你是谁？" }
    //     ],
    // });
    // console.log(JSON.stringify(completion));
    // 测试 Stream Text
    const alibaba = createAlibaba({
        apiKey: process.env.ALIBABA_API_KEY ?? '',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    });


    const { textStream } = streamText({
        model: alibaba('qwen-plus'),
        prompt: '你是谁？',
    });

    for await (const textPart of textStream) {
        process.stdout.write(textPart);
    }
}