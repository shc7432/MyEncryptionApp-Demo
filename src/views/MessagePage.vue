<template>
  <div class="message-page">
    <h2>消息加密/解密</h2>
    
    <div class="input-section">
      <textarea v-model="inputText" placeholder="输入要加密的消息或要解密的密文"></textarea>
      <input autocomplete="off" type="password" v-model="password" placeholder="输入密码">
      
      <div class="button-group">
        <button @click="encryptText" :disabled="isLoading">加密</button>
        <button @click="decryptText" :disabled="isLoading">解密</button>
        <button @click="clearAll" :disabled="isLoading">清空</button>
      </div>
    </div>
    
    <div class="output-section">
      <h3>结果:</h3>
      <div class="output-box">{{ outputText }}</div>
      <button v-if="outputText" @click="copyToClipboard" class="copy-button">{{ copyButtonText }}</button>
    </div>
  </div>
</template>

<script>
import { encrypt_data, decrypt_data } from 'simple-data-crypto/builder'

export default {
  name: 'MessagePage',
  data() {
    return {
      inputText: '',
      password: '',
      outputText: '',
      copyButtonText: '复制结果',
      isLoading: false
    }
  },
  methods: {
    async encryptText() {
      if (!this.inputText || !this.password) {
        this.outputText = ('请输入消息和密码')
        return
      }
      
      try {
        this.isLoading = true
        this.outputText = '加密中...'
        this.outputText = await encrypt_data(this.inputText, this.password)
      } catch (error) {
        this.outputText = '加密失败: ' + error
      } finally {
        this.isLoading = false
      }
    },
    async decryptText() {
      if (!this.inputText || !this.password) {
        this.outputText = ('请输入密文和密码')
        return
      }
      
      try {
        this.isLoading = true
        this.outputText = '解密中...'
        this.outputText = await decrypt_data(this.inputText, this.password)
      } catch (error) {
        this.outputText = '解密失败: ' + error
      } finally {
        this.isLoading = false
      }
    },
    clearAll() {
      this.inputText = ''
      this.password = ''
      this.outputText = ''
    },
    async copyToClipboard() {
      if (!this.outputText) return;
      
      const originalText = this.copyButtonText;
      try {
        await navigator.clipboard.writeText(this.outputText);
        this.copyButtonText = '复制成功!';
      } catch (err) {
        this.copyButtonText = '复制失败!';
      }
      setTimeout(() => {
        this.copyButtonText = originalText;
      }, 1500);
    }
  }
}
</script>

<style scoped>
.message-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
}

.input-section {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 150px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

input[type="password"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
}

button {
  flex: 1;
  padding: 10px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

button:not(:disabled):hover {
  background: #1a2a3a;
}

.output-section {
  margin-top: 20px;
}

.output-box {
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>