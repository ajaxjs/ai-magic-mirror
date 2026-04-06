import { createWebHashHistory, createRouter } from 'vue-router'

import Dashboard from '@/layouts/dashboard.vue'

const routes = [
    { path: '/', component: () => import('@/pages/index.vue') },
    {
        path: '/demo/text',
        component: () => import('@/pages/demo/text.vue'),
    },
    {
        path: '/demo/animate',
        component: () => import('@/pages/demo/animate.vue'),
    },
    {
        path: '/demo/background',
        component: () => import('@/pages/demo/background.vue'),
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router