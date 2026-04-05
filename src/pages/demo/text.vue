<script setup lang="ts">
import SplitText from '@/components/bits/SplitText/SplitText.vue'
import Shuffle from '@/components/bits/Shuffle/Shuffle.vue'
import ShinyText from '@/components/bits/ShinyText/ShinyText.vue'
import ScrollVelocity from '@/components/bits/ScrollVelocity/ScrollVelocity.vue'
import GlitchText from '@/components/bits/GlitchText/GlitchText.vue'
import DecryptedText from '@/components/bits/DecryptedText/DecryptedText.vue'
import CountUp from '@/components/bits/CountUp/CountUp.vue'
import BlurText from '@/components/bits/BlurText/BlurText.vue'
import ASCIIText from '@/components/bits/ASCIIText/ASCIIText.vue'
import TextType from '@/components/bits/TextType/TextType.vue'

const handleAnimationComplete = () => {
    console.log('Animation complete!');
}
const handleStart = () => {
    console.log("Count animation started!");
};

const handleEnd = () => {
    console.log("Count animation ended!");
};
</script>

<template>
    <div class="p-5">
        <div class="item-box">
            <SplitText text="Hey there sexy!" class-name="text-6xl/24 font-semibold text-center" :delay="100"
                :duration="0.6" ease="power3.out" split-type="chars" :from="{ opacity: 0, y: 40 }"
                :to="{ opacity: 1, y: 0 }" :threshold="0.1" root-margin="0" text-align="center"
                @animation-complete="handleAnimationComplete" />
        </div>
        <div class="item-box">
            <Shuffle text="Hello World" shuffle-direction="right" :duration="0.35" animation-mode="evenodd"
                :shuffle-times="1" ease="power3.out" :stagger="0.03" :threshold="0.1" :trigger-once="true"
                :trigger-on-hover="true" :respect-reduced-motion="true" />
        </div>
        <div class="item-box">
            <ShinyText text="✨ Shiny Text Effect" :speed="2" :delay="0.5" :disabled="false" :color="'#b5b5b5'"
                :shine-color="'#ff9900'" :spread="120" :direction="'left'" :yoyo="false" :pause-on-hover="false" />
        </div>
        <div class="item-box">
            <ScrollVelocity :texts="['Vue Bits', 'Scroll Down']" :velocity="100" :damping="50" :stiffness="400"
                :velocity-mapping="{ input: [0, 1000], output: [0, 5] }" class-name="custom-scroll-text"
                parallax-class-name="custom-parallax" scroller-class-name="custom-scroller" />
        </div>
        <div class="item-box">
            <GlitchText children="Vue Bits" :speed="1.5" :enable-shadows="true" :enable-on-hover="false" />
        </div>
        <div class="item-box">
            <DecryptedText text="Hello World!" :speed="50" :max-iterations="10" :sequential="false"
                reveal-direction="start" :use-original-chars-only="false" animate-on="view" class-name="text-green-500"
                encrypted-class-name="text-red-500" />
        </div>
        <div class="item-box">
            <CountUp :from="0" :to="100" separator="," direction="up" :duration="1" :delay="0" :start-when="true"
                class-name="count-up-text" @start="handleStart" @end="handleEnd" />
        </div>
        <div class="item-box">
            <BlurText text="Isn't this so cool?!" animate-by="words" direction="top" :delay="200"
                class-name="text-2xl font-semibold text-center" @animation-complete="handleAnimationComplete" />
        </div>
        <div class="item-box relative h-[300px]">
            <ASCIIText text="Hey!" :ascii-font-size="8" :text-font-size="200" text-color="#fdf9f3"
                :plane-base-height="8" :enable-waves="true" class-name="w-full h-full" />
        </div>
        <div class="item-box">
            <TextType :text="['Text typing effect', 'for your websites', 'Happy coding!']" :typingSpeed="75"
                :pauseDuration="1500" :showCursor="true" cursorCharacter="|" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.item-box {
    border: 1px solid #262b3b;
    padding: 20px;
    margin-bottom: 20px;
}
</style>