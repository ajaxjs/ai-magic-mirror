<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

import Aurora from '@/components/bits/Aurora/Aurora.vue'
import Ballpit from '@/components/bits/Ballpit/Ballpit.vue'
import ColorBends from '@/components/bits/ColorBends/ColorBends.vue'
import FloatingLines from '@/components/bits/FloatingLines/FloatingLines.vue'
import Galaxy from '@/components/bits/Galaxy/Galaxy.vue'
import GridScan from '@/components/bits/GridScan/GridScan.vue'
import LightPillar from '@/components/bits/LightPillar/LightPillar.vue'
import Lightning from '@/components/bits/Lightning/Lightning.vue'
import LiquidEther from '@/components/bits/LiquidEther/LiquidEther.vue'
import Orb from '@/components/bits/Orb/Orb.vue'

const bg = ref('aurora')
const btns = ['aurora', 'ballpit', 'color-bends', 'floating-lines', 'galaxy', 'grid-scan', 'light-pillar', 'lightning', 'liquid-ether', 'orb']

</script>

<template>
    <div v-if="bg === 'aurora'">
        <Aurora :color-stops="['#7cff67', '#171D22', '#7cff67']" :amplitude="1.0" :blend="0.5" :speed="1.0"
            :intensity="1.0" class="w-full h-full" />
    </div>
    <div v-else-if="bg === 'ballpit'" class="relative w-full h-100 overflow-hidden">
        <Ballpit :count="100" :gravity="0.5" :friction="0.9" :wallBounce="0.95" :followCursor="true"
            :colors="[100, 0, 0]" />
    </div>
    <div v-else-if="bg === 'color-bends'" class="relative w-full h-dvh overflow-hidden">
        <ColorBends :colors="['#ff5c7a', '#8a5cff', '#00ffd1']" :rotation="0" :speed="0.3" :scale="1.6" :frequency="1.4"
            :warpStrength="0.9" :mouseInfluence="0.8" :parallax="0.6" :noise="0.1" transparent />
    </div>
    <div v-else-if="bg === 'floating-lines'">
        <FloatingLines :enabled-waves="['top', 'middle', 'bottom']" :line-count="[5, 8, 10]" :line-distance="[8, 6, 4]"
            :bend-radius="5.0" :bend-strength="-0.5" :interactive="true" :parallax="true" />
    </div>
    <div v-else-if="bg === 'galaxy'" class="relative w-full h-[600px]">
        <Galaxy :mouse-repulsion="false" :mouse-interaction="false" :density="1.5" :glow-intensity="0.5"
            :saturation="0.8" :hue-shift="240" />
    </div>
    <div v-else-if="bg === 'grid-scan'" class="relative w-full h-[600px]">
        <GridScan :line-thickness="1" :grid-scale="0.1" :line-jitter="0.1" lines-color="#392e4e" scan-color="#FF9FFC"
            :enable-post="true" :chromatic-aberration="0.002" :noise-intensity="0.01" :scan-glow="0.5"
            :scan-softness="2" :enable-webcam="false" :show-preview="false" />
    </div>
    <div v-else-if="bg === 'light-pillar'" style="width: 100%; height: 600px; position: relative;">
        <LightPillar topColor="#48FF28" bottomColor="#9EF19E" :intensity="1.0" :rotationSpeed="0.5" :glowAmount="0.002"
            :pillarWidth="3.0" :pillarHeight="0.4" :noiseIntensity="0.5" :pillarRotation="25" :interactive="false"
            mixBlendMode="normal" />
    </div>
    <div v-else-if="bg === 'lightning'" class="lightning-container">
        <Lightning :hue="230" :x-offset="0" :speed="1" :intensity="1" :size="1" class="w-full h-full" />
    </div>
    <div v-else-if="bg === 'liquid-ether'" style="width: 100%; height: 600px; position: relative">
        <LiquidEther :colors="['#48FF28', '#A2FFC6', '#9EF19E']" :mouseForce="20" :cursorSize="100" :isViscous="false"
            :viscous="30" :iterationsViscous="32" :iterationsPoisson="32" :resolution="0.5" :isBounce="false"
            :autoDemo="true" :autoSpeed="0.5" :autoIntensity="2.2" :takeoverDuration="0.25" :autoResumeDelay="3000"
            :autoRampDuration="0.6" />
    </div>
    <div v-else-if="bg === 'orb'" class="relative w-full h-[600px]">
        <Orb :hoverIntensity="0.5" :rotateOnHover="true" :hue="0" :forceHoverState="false" />
    </div>

    <div class="absolute bottom-0 left-0 right-0 p-5 flex gap-2 flex-wrap">
        <Button v-for="item in btns" :key="item" @click="bg = item">{{ item }}</Button>
    </div>
</template>

<style lang="scss" scoped>
.hyperspeed-container {
    width: 100%;
    height: 100%;
    cursor: pointer;
}
</style>