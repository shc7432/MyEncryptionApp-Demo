import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { setConfigProvider } from 'common-file-preview'
setConfigProvider({
    async get(name) {
        return localStorage.getItem('MyEncryptionApp::preview::preference::' + name) || null
    },
    async set(name, value) {
        localStorage.setItem('MyEncryptionApp::preview::preference::' + name, value);
    },
})

createApp(App).use(router).mount('#app')