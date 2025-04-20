import { createRouter, createWebHashHistory } from 'vue-router'
import MessagePage from '../views/MessagePage.vue'
import FilePage from '../views/FilePage.vue'

const routes = [
  {
    path: '/message',
    name: 'message',
    component: MessagePage
  },
  {
    path: '/file',
    name: 'file',
    component: FilePage
  },
  {
    path: '/',
    redirect: '/message'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router