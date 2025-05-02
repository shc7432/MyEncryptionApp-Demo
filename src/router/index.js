import { createRouter, createWebHashHistory } from 'vue-router'
import MessagePage from '../views/MessagePage.vue'
import FilePage from '../views/FilePage.vue'
import FileClassicPage from '../views/FileClassicPage.vue'
import VideoDecryption from '../views/VideoDecryption.vue'

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
    path: '/file-classic',
    name: 'file-classic',
    component: FileClassicPage
  },
  {
    path: '/video-decrypt',
    name: 'video-decrypt',
    component: VideoDecryption
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