import { createRouter, createWebHashHistory } from 'vue-router'
const MessagePage = () => import('../views/MessagePage.vue')
const FilePage = () => import('../views/FilePage.vue')
const FileClassicPage = () => import('../views/FileClassicPage.vue')
const VideoDecryption = () => import('../views/VideoDecryption.vue')
const FilePreview = () => import('../views/FilePreview.vue')

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
    path: '/preview',
    name: 'FilePreview',
    component: FilePreview
  },
  {
    path: '/video-decrypt',
    name: 'video-decrypt',
    component: VideoDecryption
  },
  {
    path: '/',
    redirect: '/message'
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router