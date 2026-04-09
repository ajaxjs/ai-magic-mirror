<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    x: {
        type: [Number, String],
        default: 1
    },
    y: {
        type: [Number, String],
        default: 1
    },
    w: {
        type: Number,
        default: 1,
        validator(num: number) {
            return num > 0 && num <= 12;
        }
    },
    h: {
        type: Number,
        default: 1,
        validator(num: number) {
            return num > 0 && num <= 12;
        }
    },
})
const style = computed(() => {
    const { x, y, w, h } = props;

    let cols: any[] = [x]
    let rows: any[] = [y]
    if (Number.isInteger(x)) {
        x as number >= 0 ? cols.push(`span ${w}`) : cols.unshift(`span ${w}`)
    }
    if (Number.isInteger(y)) {
        y as number >= 0 ? rows.push(`span ${h}`) : rows.unshift(`span ${h}`)
    }
    console.log(cols, rows)
    return {
        gridRow: rows.join(' / '),
        gridColumn: cols.join(' / '),
    }
})
</script>

<template>
    <div class="item" :style="style">
        <slot></slot>
    </div>
</template>

<style lang="scss" scoped>
.item {
    border: 1px solid #666;
    text-align: center;
}
</style>