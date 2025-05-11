<template>
  <div class="file-page">
    <h2>文件加密/解密</h2>
    
    <div class="input-section">
      <div class="file-select-group">
        <button @click="selectFile" style="flex: unset; padding: 10px 20px;">选择文件</button>
        <div class="file-name">{{ selectedFile?.name || '没有选择文件' }}</div>
      </div>
      <input type="password" v-model="password" placeholder="输入密码">
      
      <div class="chunk-size-group">
        <div class="chunk-size-header">
          <label>分块大小(MiB):</label>
          <input type="number" v-model.number="chunkSize" min="1" max="128">
        </div>
        
        <details class="hint-box" open>
          <summary class="hint-title">分块大小建议:</summary>
          <ul class="hint-list">
            <li><strong>大文件(32MiB)</strong>: 整体文件处理，提高性能</li>
            <li><strong>视频文件(5-32MiB)</strong>: 增强随机读取性能</li>
            <li><strong>一般视频(5MiB)</strong>: 适合大多数视频文件</li>
            <li><strong>较大视频(16-32MiB)</strong>: 适合高清/4K视频</li>
          </ul>
          
          <div class="warning-text">
            ⚠️ 注意: 分块太小会导致文件被分成过多块，可能产生大量请求次数，造成额外费用。
            请根据文件类型和大小选择合适的分块大小。
          </div>
        </details>
      </div>
      
      <div class="button-group" style="margin-top: 0.5em;">
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
import { encrypt_file, decrypt_file, change_file_password } from 'simple-data-crypto/builder'

export default {
  name: 'FilePage',
  data() {
    return {
      selectedFileHandle: null,
      selectedFile: null,
      password: '',
      chunkSize: 32, // 默认32MiB
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
      if (!this.selectedFile) {
        this.statusMessage = '请选择文件';
        return;
      }
      if (!this.password) {
        if (!confirm('确定要使用空密码？这非常不安全！')) return;
      }
      
      this.isLoading = true;
      try {
        const encryptedFileName = `${this.selectedFile.name}.enc`;
        const saveHandle = await window.showSaveFilePicker({
          suggestedName: encryptedFileName
        });
        
        const writable = await saveHandle.createWritable();
        const chunkSize = this.chunkSize * 1024 * 1024;
        
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
      if (!this.selectedFile) {
        this.statusMessage = '请选择文件';
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
          }
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
      if (!this.selectedFile) {
        this.statusMessage = '请选择文件';
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
        if (!confirm('确定要使用空密码？这非常不安全！')) return;
      }
      
      this.isLoading = true;
      try {
        this.statusMessage = '正在处理...';
        const fileHandle = this.selectedFileHandle;
        
        const file = this.selectedFile;
        const blob = file.slice(0, 5000);
        
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

.chunk-size-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.hint-box {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #4a89dc;
}

.hint-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #2c3e50;
}

.hint-list {
  margin: 10px 0;
  padding-left: 20px;
  text-align: left;
}

.hint-list li {
  margin-bottom: 5px;
  color: #555;
}

.warning-text {
  margin-top: 10px;
  padding: 10px;
  background: #fff8e1;
  border-radius: 4px;
  color: #e65100;
  font-size: 0.9em;
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