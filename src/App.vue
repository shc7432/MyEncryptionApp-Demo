<template>
  <div id="app">
    <nav>
      <router-link to="/message">消息加密</router-link>
      <router-link to="/file" v-show="supportsFileAPI">文件加密</router-link>
      <router-link to="/file-classic" v-show="!supportsFileAPI">文件加密(兼容版)</router-link>
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 1S0px;
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
</style>