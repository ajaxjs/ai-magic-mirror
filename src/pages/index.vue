<script setup lang="ts">
import GridLayout from '@/components/grid/GridLayout.vue'
import GridItem from '@/components/grid/GridItem.vue'

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
            top_bar1
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