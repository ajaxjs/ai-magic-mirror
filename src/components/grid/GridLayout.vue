<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    cols: { type: Number, default: 12 },
    rows: { type: Number, default: 12 },
    gap: { type: [Number, String], default: 10 },
})

const style = computed(() => {
    const { cols, rows, gap } = props
    return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: Number.isInteger(gap) ? `${gap}px` : `${gap}`,
    }
})
</script>

<template>
    <div class="w-screen h-screen grid" :style="style">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped></style>