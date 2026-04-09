import { createWebHashHistory, createRouter } from 'vue-router'

const routes = [
    { path: '/', component: () => import('@/views/index.vue') },
    {
        path: '/demo/text',
        component: () => import('@/views/demo/text.vue'),
    },
    {
        path: '/demo/animate',
        component: () => import('@/views/demo/animate.vue'),
    },
    {
        path: '/demo/background',
        component: () => import('@/views/demo/background.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router