<template>
  <div class="file-page">
    <h2>文件加密/解密</h2>
    
    <div class="input-section">
      <input type="file" @change="handleFileChange" ref="fileInput">
      <input type="password" v-model="password" placeholder="输入密码">
      
      <div class="button-group">
        <button @click="encryptFile">加密文件</button>
        <button @click="decryptFile">解密文件</button>
        <button @click="clearAll">清空</button>
      </div>
    </div>
    
    <div class="status-section" v-if="statusMessage">
      <h3>状态:</h3>
      <div class="status-box">{{ statusMessage }}</div>
    </div>
  </div>
</template>

<script>
import { encrypt_file, decrypt_file } from '../../modules/MyEncryption/dist/main.bundle.js'

export default {
  name: 'FilePage',
  data() {
    return {
      selectedFile: null,
      password: '',
      statusMessage: ''
    }
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0]
      this.statusMessage = `已选择文件: ${this.selectedFile.name}`
    },
    async encryptFile() {
      if (!this.selectedFile || !this.password) {
        this.statusMessage = '请选择文件并输入密码'
        return
      }
      
      try {
        const encryptedFileName = `${this.selectedFile.name}.enc`
        const fileReader = (start, end) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(new Uint8Array(reader.result.slice(start, end)))
            reader.readAsArrayBuffer(this.selectedFile)
          })
        }
        const chunks = []
        const fileWriter = (data) => {
          chunks.push(data)
          return Promise.resolve()
        }
        await encrypt_file(fileReader, fileWriter, this.password)
        
        const blob = new Blob(chunks, { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = encryptedFileName
        a.click()
        URL.revokeObjectURL(url)
        
        this.statusMessage = `文件加密成功，已下载: ${encryptedFileName}`
      } catch (error) {
        this.statusMessage = '加密失败: ' + error.message
      }
    },
    async decryptFile() {
      if (!this.selectedFile || !this.password) {
        this.statusMessage = '请选择文件并输入密码'
        return
      }
      
      try {
        const decryptedFileName = this.selectedFile.name.endsWith('.enc') 
          ? this.selectedFile.name.slice(0, -4) 
          : `decrypted_${this.selectedFile.name}`
        
        const fileReader = (start, end) => {
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(new Uint8Array(reader.result.slice(start, end)))
            reader.readAsArrayBuffer(this.selectedFile)
          })
        }
        const chunks = []
        const fileWriter = (data) => {
          chunks.push(data)
          return Promise.resolve()
        }
        await decrypt_file(fileReader, fileWriter, this.password)
        
        const blob = new Blob(chunks, { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = decryptedFileName
        a.click()
        URL.revokeObjectURL(url)
        
        this.statusMessage = `文件解密成功，已下载: ${decryptedFileName}`
      } catch (error) {
        this.statusMessage = '解密失败: ' + error.message
      }
    },
    clearAll() {
      this.$refs.fileInput.value = ''
      this.selectedFile = null
      this.password = ''
      this.statusMessage = ''
    }
  }
}
</script>

<style scoped>
.file-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.input-section {
  margin-bottom: 20px;
}

input[type="file"] {
  width: 100%;
  margin-bottom: 10px;
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

button:hover {
  background: #1a2a3a;
}

.status-section {
  margin-top: 20px;
}

.status-box {
  min-height: 50px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f9f9f9;
}
</style>