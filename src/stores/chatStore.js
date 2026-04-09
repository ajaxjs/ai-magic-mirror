import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
    state: () => {
        return {
            isReady: false,
            isInit: false,
            isWake: false,
            isSpeaking: false,
        }
    },
    actions: {
        increment() {
            this.count++
        },
    },
})