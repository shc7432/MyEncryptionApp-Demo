<template>
  <div class="file-page">
    <h2>文件加密/解密</h2>
    
    <div class="input-section">
      <div class="file-select-group">
        <button @click="selectFile" style="flex: unset; padding: 10px 20px;">选择文件</button>
        <div class="file-name">{{ selectedFile?.name || '没有选择文件' }}</div>
      </div>
      <input type="password" v-model="password" placeholder="输入密码">
      
      <div class="button-group">
        <button @click="encryptFile" :disabled="isLoading">加密</button>
        <button @click="decryptFile" :disabled="isLoading">解密</button>
        <button @click="changePassword" :disabled="isLoading">改密</button>
        <button @click="clearAll" :disabled="isLoading">清除</button>
      </div>
    </div>
    
    <div class="password-change-section" v-if="showPasswordChange">
      <h3>更改密码</h3>
      <input type="password" v-model="newPassword" placeholder="输入新密码">
      <div class="button-group">
        <button @click="confirmPasswordChange" :disabled="isLoading">确认更改</button>
        <button @click="cancelPasswordChange" :disabled="isLoading">取消</button>
      </div>
    </div>
    
    <div class="status-section" v-if="statusMessage">
      <h3>状态:</h3>
      <div class="status-box">{{ statusMessage }}</div>
    </div>
  </div>
</template>

<script>
import { encrypt_file, decrypt_file, change_file_password } from '../../modules/MyEncryption/dist/main.bundle.js'

export default {
  name: 'FilePage',
  data() {
    return {
      selectedFileHandle: null,
      selectedFile: null,
      password: '',
      statusMessage: '',
      isLoading: false,
      showPasswordChange: false,
      newPassword: ''
    }
  },
  methods: {
    async selectFile() {
      try {
        const [fileHandle] = await window.showOpenFilePicker({writable: true, multiple: false});
        this.selectedFileHandle = fileHandle;
        this.selectedFile = await fileHandle.getFile();
        this.statusMessage = `已选择文件: ${this.selectedFile.name}`;
      } catch (error) {
        this.statusMessage = '文件选择取消或出错: ' + error.message;
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
        const saveHandle = await window.showSaveFilePicker({
          suggestedName: encryptedFileName
        });
        
        const writable = await saveHandle.createWritable();
        const chunkSize = 32 * 1024 * 1024; // 32MB分块
        
        await encrypt_file(
          async (start, end) => {
            const chunk = await this.selectedFile.slice(start, end).arrayBuffer();
            return new Uint8Array(chunk);
          },
          (data) => writable.write(data),
          this.password,
          (progress) => {
            const percent = Number(progress / this.selectedFile.size * 100);
            if (progress >= this.selectedFile.size || percent === 100 || percent.toFixed(2) === '100.00') {
              this.statusMessage = '正在保存文件，请稍候...这可能需要一些时间。';
            } else {
              this.statusMessage = `加密中... ${percent.toFixed(2)}%`;
            }
          },
          null,
          null,
          chunkSize
        );
        
        await writable.close();
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
          
        const saveHandle = await window.showSaveFilePicker({
          suggestedName: decryptedFileName
        });
        
        const writable = await saveHandle.createWritable();
        const chunkSize = 32 * 1024 * 1024; // 32MB分块
        
        await decrypt_file(
          async (start, end) => {
            const chunk = await this.selectedFile.slice(start, end).arrayBuffer();
            return new Uint8Array(chunk);
          },
          (data) => writable.write(data),
          this.password,
          (progress) => {
            const percent = Number(progress / this.selectedFile.size * 100);
            if (progress >= this.selectedFile.size || percent === 100 || percent.toFixed(2) === '100.00') {
              this.statusMessage = '正在保存文件，请稍候...这可能需要一些时间。';
            } else {
              this.statusMessage = `解密中... ${percent.toFixed(2)}%`;
            }
          },
          null,
          null,
          chunkSize
        );
        
        await writable.close();
        this.statusMessage = `文件解密成功: ${decryptedFileName}`;
      } catch (error) {
        this.statusMessage = '解密失败: ' + error.message;
      } finally {
        this.isLoading = false;
      }
    },
    clearAll() {
      this.selectedFile = null
      this.password = ''
      this.statusMessage = ''
    },
    changePassword() {
      if (!this.selectedFile || !this.password) {
        this.statusMessage = '请选择文件并输入当前密码';
        return;
      }
      this.showPasswordChange = true;
      this.newPassword = '';
      this.confirmPassword = '';
    },
    
    cancelPasswordChange() {
      this.showPasswordChange = false;
      this.newPassword = '';
      this.confirmPassword = '';
    },
    
    async confirmPasswordChange() {
      if (!this.newPassword) {
        this.statusMessage = '请输入新密码';
        return;
      }
      
      this.isLoading = true;
      try {
        this.statusMessage = '正在处理...';
        const fileHandle = this.selectedFileHandle;
        
        const file = this.selectedFile;
        const blob = file.slice(0, 2048);
        
        this.statusMessage = '正在更改密码，请稍候...';
        const newFileHead = await change_file_password(blob, this.password, this.newPassword);
        
        this.statusMessage = '正在保存文件，请稍候...这可能需要一些时间。';
        const writable = await fileHandle.createWritable({ keepExistingData: true });
        await writable.write(newFileHead);
        await writable.close();
        
        this.statusMessage = '密码更改成功';
        this.showPasswordChange = false;
        this.newPassword = '';
        this.confirmPassword = '';
      } catch (error) {
        this.statusMessage = '密码更改失败: ' + error.message;
      } finally {
        this.isLoading = false;
      }
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

.file-select-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.file-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
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

button:not(:disabled):hover {
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