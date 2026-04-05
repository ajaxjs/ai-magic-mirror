<template>
    <Card class="item col-span-4 col-start-2 p-5">
        <Button @click="$router.push('/demo/text')">Text Demo</Button>
        <Button @click="$router.push('/demo/animate')">Animate Demo</Button>
        <Button @click="$router.push('/demo/background')">Background Demo</Button>
    </Card>
    <Card class="item col-start-1 col-end-3">02</Card>
    <Card class="item col-span-2 col-end-7">03</Card>
    <Card class="item col-start-1 col-end-7">
        <SplitText text="Hey there sexy!" class-name="text-6xl/24 font-semibold text-center" :delay="100"
            :duration="0.6" ease="power3.out" split-type="chars" :from="{ opacity: 0, y: 40 }"
            :to="{ opacity: 1, y: 0 }" :threshold="0.1" root-margin="0" text-align="center"
            @animation-complete="handleAnimationComplete" />
        <ScrollVelocity :texts="['Vue Bits', 'Scroll Down']" :velocity="100" :damping="50" :stiffness="400"
            :velocity-mapping="{ input: [0, 1000], output: [0, 5] }" class-name="custom-scroll-text"
            parallax-class-name="custom-parallax" scroller-class-name="custom-scroller" />
    </Card>
    <div class="col-span-6">
        <h1>💖 Hello World!</h1>
        <p>Welcome to your Electron application.</p>
        <p>You clicked {{ counterStore.count }} times</p>
        <Button @click="handleClick">Click me</Button>
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import SplitText from '@/components/bits/SplitText/SplitText.vue'
import ScrollVelocity from '@/components/bits/ScrollVelocity/ScrollVelocity.vue'
import { useCounterStore } from '@/stores/counter'

const handleAnimationComplete = () => {
    console.log('Animation complete!');
}

const counterStore = useCounterStore()
//const { count } = counterStore
const handleClick = () => {
    counterStore.increment()
}
console.log('👋 This message is being logged by "App.vue", included via Vite');
</script>

<style lang="scss" scoped></style>
