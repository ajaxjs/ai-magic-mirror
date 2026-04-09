<script setup lang="ts">
// 布局参考：https://grid.layoutit.com/
import { computed } from 'vue';

const props = defineProps({
    cols: { type: Number, default: 12 },
    rows: { type: Number, default: 12 },
    gap: { type: [Number, String], default: 10 },
    mesh: { type: Boolean, default: false },
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
    <div class="layout w-screen h-screen grid" :class="{'mesh': mesh}" :style="style">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.mesh {
    background-image:
        linear-gradient(to right, rgba(255, 0, 0, 0.2) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 0, 0, 0.2) 1px, transparent 1px);
    background-size: calc(100% / 12) calc(100% / 12);
}
</style>