<script setup lang="ts">
import GridLayout from '@/components/grid/GridLayout.vue'
import GridItem from '@/components/grid/GridItem.vue'
</script>

<template>
    <GridLayout>
        <GridItem x="1 / span 12">
            top_bar
        </GridItem>
        <GridItem :x="1" :y="2" :w="4" :h="3">
            top_bar1
        </GridItem>
        <GridItem :x="-5" :y="2" :w="4" :h="3">
            top_bar2
        </GridItem>
        <GridItem :x="-1" :y="2" :w="4" :h="3">
            top_bar3
        </GridItem>
        <!-- <GridItem x="1" y="2">
            top_bar1
        </GridItem>
        <GridItem x="5" y="2">
            top_bar2
        </GridItem>
        <GridItem x="9" y="2">
            top_bar3
        </GridItem> -->
        <GridItem :x="1" :y="-1" :w="6">
            左下角
        </GridItem>
        <GridItem :x="-1" :y="-1" :w="6">
            右下角
        </GridItem>
    </GridLayout>
</template>

<style lang="scss" scoped></style>