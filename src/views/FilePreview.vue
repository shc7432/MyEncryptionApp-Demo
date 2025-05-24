<template>
    <div class="file-preview" @change="updateGuessedType">
        <div class="mode-selector">
            <label>
                <input type="radio" v-model="mode" value="local" /> 本地文件
            </label>
            <label>
                <input type="radio" v-model="mode" value="remote" /> 在线文件
            </label>
        </div>

        <input v-if="mode === 'local'" type="file" ref="filebox" />
        <input v-if="mode === 'remote'" type="text" v-model="fileUrl" placeholder="输入文件URL" />
        <input type="password" v-model="password" placeholder="输入解密密码" @change.stop />
        <select v-model="type" @change.stop>
            <option value="text/plain">文本</option>
            <option value="image">图片</option>
            <option value="video">视频</option>
            <option value="audio/mp3">音频</option>
            <option value="application/pdf">PDF</option>
            <option value="docx">Microsoft Office 文档</option>
        </select>
        <button @click="doPreview"
            :disabled="(!fileUrl && mode === 'remote')">预览</button>

        <dialog style="width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;" ref="dlg"
            @close="handleDialogClose">
            <simple-data-crypto-file-preview v-if="shouldCreate" ref="preview" style="flex: 1"></simple-data-crypto-file-preview>
            <button @click="closeDialog" style="margin-top: 0.5em;">关闭</button>
        </dialog>
    </div>
</template>

<script>
import '../simple-data-crypto-file-preview.js';
export default {
    data() {
        return {
            file: null,
            fileUrl: '',
            password: '',
            mode: 'local',
            type: 'text/plain',
            shouldCreate: false,
        }
    },

    methods: {
        guessFileType(fileName = '') {
            if (!fileName) {
                return 'text/plain';
            }
            if (fileName.endsWith('.enc')) {
                fileName = fileName.slice(0, -4);
            }
            const ext = fileName.split('.').pop().toLowerCase();
            switch (ext) {
                case 'txt':
                    return 'text/plain';
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'bmp':
                case 'webp':
                    return 'image';
                case 'mp4':
                    return 'video';
                case 'mp3':
                case 'wav':
                    return 'audio/' + ext;
                case 'pdf':
                    return 'application/pdf';
                case 'docx':
                    return 'docx';
                default:
                    return 'text/plain';
            }
        },
        updateGuessedType() {
            if (this.mode === 'local') {
                this.type = this.guessFileType(this.$refs.filebox?.files?.[0]?.name);
            } else if (this.mode === 'remote') try {
                const url = new URL(this.fileUrl);
                this.type = this.guessFileType(url.pathname);
            } catch { }
        },
        async getFileSize(url) {
            const abortController = new AbortController();
            const resp = await fetch(url, { signal: abortController.signal });
            if (!resp.ok) {
                throw new Error(`Failed to fetch file size: ${resp.statusText}`);
            }
            const contentLength = +resp.headers.get('Content-Length');
            if (isNaN(contentLength)) {
                throw new Error('Content-Length header is missing or invalid');
            }
            abortController.abort();
            return contentLength;
        },
        async doPreview() {
            this.file = (this.mode === 'local') && this.$refs.filebox.files?.[0];
            if (!this.file && this.mode === 'local') {
                alert('请选择一个文件');
                return;
            }
            try {
                this.$refs.dlg.showModal();
                this.shouldCreate = true;
                const fileReader = (this.mode === 'local') ? async (start, end) => {
                    const blob = this.file.slice(start, end);
                    return new Uint8Array(await blob.arrayBuffer());
                } : async (start, end, signal) => {
                    const resp = await fetch(this.fileUrl, {
                        headers: {
                            'Range': `bytes=${start}-${end - 1}`
                        },
                        method: 'GET',
                        signal
                    });
                    return new Uint8Array(await resp.arrayBuffer());
                };
                await new Promise((resolve, reject) => {
                    this.$nextTick(() => this.$nextTick(resolve));
                })
                const filename = (this.type === 'docx') ? 'File.docx' : 'File';
                await this.$refs.preview.load(fileReader, this.password,
                    this.mode === 'local' ? this.file.size : await this.getFileSize(this.fileUrl),
                    this.type, filename);
            } catch (e) {
                console.error(e);
                alert(e);
                this.$refs.dlg.close();
                this.shouldCreate = false;
            }
        },
        closeDialog() {
            this.$refs.dlg.close();
            this.shouldCreate = false;
        },
        handleDialogClose() {
        }
    }
}
</script>

<style scoped>
.file-preview  {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
}

.mode-selector {
    display: flex;
    gap: 20px;
    margin-bottom: 10px;
}

.mode-selector label {
    display: flex;
    align-items: center;
    gap: 5px;
}

input[type="file"] {
    width: 100%;
    margin-bottom: 10px;
}

input:not([type="file"]):not([type="radio"]), select {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}

button {
    width: 100%;
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

dialog:not(:modal) {
    display: none !important;
}

simple-data-crypto-file-preview {
    text-align: left;
}
</style>