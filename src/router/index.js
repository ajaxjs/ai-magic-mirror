import { createWebHashHistory, createRouter } from 'vue-router'

import Dashboard from '@/layouts/dashboard.vue'

const routes = [
    {
        path: '/',
        component: Dashboard,
        children: [
            { path: '/', component: () => import('@/pages/index.vue') },
        ]
    },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router