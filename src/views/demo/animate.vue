<script setup lang="ts">
import { ref } from 'vue'
import ElectricBorder from '@/components/bits/ElectricBorder/ElectricBorder.vue'
import Counter from '@/components/bits/Counter/Counter.vue'
import { Button } from '@/components/ui/button'

const num = ref(1)
</script>

<template>
    <div class="p-5">
        <div class="item-box">
            <ElectricBorder :color="'#7df9ff'" :speed="1" :chaos="0.5" :thickness="2" :style="{ borderRadius: '16px' }">
                <div class="w-100 h-50 p-10">
                    <p :style="{ margin: '6px 0 0', opacity: 0.8 }">
                        A glowing, animated border wrapper.
                    </p>
                </div>
            </ElectricBorder>
        </div>
        <div class="item-box">
            <Counter :value="num" :places="[100, 10, 1]" :fontSize="80" :padding="5" :gap="10" textColor="white"
                :fontWeight="900" />
            <div class="flex gap-3">
                <Button @click="num++">增加</Button>
                <Button @click="num--">减少</Button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.item-box {
    border: 1px solid #214135;
    padding: 20px;
    margin-bottom: 20px;
}
</style>