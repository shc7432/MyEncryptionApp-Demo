<template>
  <div class="app">
    <nav>
      <router-link to="/message">消息</router-link>
      <router-link to="/file" v-show="supportsFileAPI">文件</router-link>
      <router-link to="/file-classic" v-show="!supportsFileAPI">文件2</router-link>
      <router-link to="/preview">预览</router-link>
      <router-link to="/video-decrypt" v-show="0">视频解密</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    supportsFileAPI() {
      return 'showSaveFilePicker' in window;
    }
  }
}
</script>

<style>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  position: absolute;
  inset: 0;
  padding: 10px;
  overflow: auto
}

nav {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

nav a {
  color: #2c3e50;
  text-decoration: none;
  padding: 10px 20px;
  border: 1px solid #2c3e50;
  border-radius: 4px;
}

nav a.router-link-exact-active {
  color: white;
  background: #2c3e50;
}

input, textarea {
  box-sizing: border-box;
}
</style>