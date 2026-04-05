<template>
    <Card class="item col-span-4 col-start-2">01</Card>
    <Card class="item col-start-1 col-end-3">02</Card>
    <Card class="item col-span-2 col-end-7">03</Card>
    <Card class="item col-start-1 col-end-7">
        <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
                Enter your email below to login to your account
            </CardDescription>
            <CardAction>
                <Button variant="link">
                    Sign Up
                </Button>
            </CardAction>
        </CardHeader>
        <CardContent>
            Content
        </CardContent>
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
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
//const { count } = counterStore
const handleClick = () => {
    counterStore.increment()
}
console.log('👋 This message is being logged by "App.vue", included via Vite');
</script>

<style lang="scss" scoped></style>
