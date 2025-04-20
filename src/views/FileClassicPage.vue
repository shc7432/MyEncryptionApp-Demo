<template>
  <div class="file-page">
    <h2>文件加密/解密(兼容版)</h2>
    
    <div class="input-section">
      <input type="file" ref="fileInput" @change="handleFileChange">
      <input type="password" v-model="password" placeholder="输入密码">
      
      <div class="button-group">
        <button @click="encryptFile" :disabled="isLoading">加密文件</button>
        <button @click="decryptFile" :disabled="isLoading">解密文件</button>
        <button @click="clearAll" :disabled="isLoading">清空</button>
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
  name: 'FileClassicPage',
  data() {
    return {
      selectedFile: null,
      password: '',
      statusMessage: '',
      isLoading: false
    }
  },
  methods: {
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        this.statusMessage = `已选择文件: ${this.selectedFile.name}`;
      }
    },
    async encryptFile() {
      if (!this.selectedFile || !this.password) {
        this.statusMessage = '请选择文件并输入密码';
        return;
      }
      
      this.isLoading = true;
      try {
        const encryptedFileName = `${this.selectedFile.name}.enc`;
        
        // 传统方式保存文件
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        
        const chunkSize = 32 * 1024 * 1024; // 32MB分块
        const fileSize = this.selectedFile.size;
        let position = 0;
        
        const chunks = [];
        
        await encrypt_file(
          async (start, end) => {
            const chunk = await this.selectedFile.slice(start, end).arrayBuffer();
            return new Uint8Array(chunk);
          },
          (data) => {
            chunks.push(data);
          },
          this.password,
          (progress) => {
            const percent = (progress / this.selectedFile.size * 100).toFixed(2);
            this.statusMessage = `加密中... ${percent}%`;
          },
          null,
          null,
          chunkSize
        );
        
        const blob = new Blob(chunks, { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = encryptedFileName;
        link.click();
        
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        this.statusMessage = `文件加密成功: ${encryptedFileName}`;
      } catch (error) {
        this.statusMessage = '加密失败: ' + error.message;
      } finally {
        this.isLoading = false;
      }
    },
    async decryptFile() {
      if (!this.selectedFile || !this.password) {
        this.statusMessage = '请选择文件并输入密码';
        return;
      }
      
      this.isLoading = true;
      try {
        const decryptedFileName = this.selectedFile.name.endsWith('.enc') 
          ? this.selectedFile.name.slice(0, -4) 
          : `decrypted_${this.selectedFile.name}`;
          
        // 传统方式保存文件
        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild(link);
        
        const chunkSize = 32 * 1024 * 1024; // 32MB分块
        const fileSize = this.selectedFile.size;
        let position = 0;
        
        const chunks = [];
        
        await decrypt_file(
          async (start, end) => {
            const chunk = await this.selectedFile.slice(start, end).arrayBuffer();
            return new Uint8Array(chunk);
          },
          (data) => {
            chunks.push(data);
          },
          this.password,
          (progress) => {
            const percent = (progress / this.selectedFile.size * 100).toFixed(2);
            this.statusMessage = `解密中... ${percent}%`;
          },
          null,
          null,
          chunkSize
        );
        
        const blob = new Blob(chunks, { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = decryptedFileName;
        link.click();
        
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        this.statusMessage = `文件解密成功: ${decryptedFileName}`;
      } catch (error) {
        this.statusMessage = '解密失败: ' + error.message;
      } finally {
        this.isLoading = false;
      }
    },
    clearAll() {
      this.$refs.fileInput.value = '';
      this.selectedFile = null;
      this.password = '';
      this.statusMessage = '';
    }
  }
}
</script>

<style scoped>
.file-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
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

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
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