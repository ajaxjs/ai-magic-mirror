<script setup lang="ts">
import GridLayout from '../components/layout/grid/GridLayout.vue'
import GridItem from '../components/layout/grid/GridItem.vue'
import Button from '../components/ui/button/Button.vue';
import { ref } from 'vue';

const text = ref('');
// function speak(text: string) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.pitch = 1.1;   // 略微柔和的女声
//     utterance.rate = 0.95;
//     utterance.volume = 0.9;
//     speechSynthesis.speak(utterance);
// }
function chat(text: string) {
    console.log('chat function called with text:', text);
    console.log('window.electronAPI:', window.electronAPI);
    if (window.electronAPI && window.electronAPI.setTitle) {
        console.log('electronAPI.setTitle is available');
        window.electronAPI.setTitle(text);
    } else {
        console.error('electronAPI.setTitle is not available');
    }
}
// 布局参考：https://grid.layoutit.com/
// UI 参考：https://codepen.io/filipz/live/yyyRgry
</script>

<template>
    <GridLayout mesh>
        <GridItem :w="12" :h="1">
            top_bar
        </GridItem>

        <GridItem :x="1" :y="2" :w="4" :h="4">
            top_bar1
        </GridItem>
        <GridItem :x="-5" :y="2" :w="4" :h="4">
            top_bar2
        </GridItem>
        <GridItem :x="-1" :y="2" :w="4" :h="4">
            top_bar3
        </GridItem>

        <GridItem :x="1" :y="6" :w="12" :h="3">
            <div class="flex gap-2 justify-center p-4">
                <input v-model="text" placeholder="请输入" class="bg-white rounded-sm text-black px-2" />
                <Button @click="chat(text)">发送</Button>
            </div>
        </GridItem>

        <GridItem :x="1" :y="-2" :w="6" :h="3">
            左下角
        </GridItem>
        <GridItem :x="-1" :y="-2" :w="6" :h="3">
            右下角
        </GridItem>
        <GridItem :y="-1" :w="12" :h="1">
            top_bar
        </GridItem>
    </GridLayout>
</template>

<style lang="scss" scoped></style>