<template>
    <div class="video-decrypt-container">
        <div class="mode-selector">
            <label>
                <input type="radio" v-model="mode" value="local" /> 本地文件
            </label>
            <label>
                <input type="radio" v-model="mode" value="remote" /> 在线文件
            </label>
        </div>
        
        <input v-if="mode === 'local'" type="file" ref="filebox" />
        <input v-if="mode === 'remote'" type="text" v-model="fileUrl" placeholder="输入视频URL" />
        <input autocomplete="off" type="password" v-model="password" placeholder="输入解密密码" />
        <button @click="playVideo" :disabled="(mode === 'local') || (!fileUrl && mode === 'remote') || playing">播放视频</button>

        <dialog style="width: 100%; height: 100%; display: flex; flex-direction: column;" ref="videoDialog" @close="handleDialogClose">
            <video v-if="playing" ref="videoPlayer" controls style="flex: 1;"></video>
            <button @click="closeDialog" style="margin-top: 0.5em;">关闭</button>
        </dialog>
    </div>
</template>

<script>
import { InputStream as Stream, crypt_context_create, crypt_context_destroy, decrypt_stream_init, decrypt_stream } from 'simple-data-crypto/builder';
import { PlayMp4Video } from 'play-video-streamed';

export default {
    name: 'VideoDecryption',
    data() {
        return {
            ctx: null,
            file: null,
            fileUrl: '',
            password: '',
            playing: false,
            cleanup: null,
            mode: 'local',
        }
    },

    methods: {
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
        async playVideo() {
            this.file = this.$refs.filebox.value?.[0];
            if (!this.file && this.mode === 'local') {
                alert('请选择一个视频文件');
                return;
            }
            try {
                this.playing = true;
                await this.$nextTick(); // Wait for DOM update

                const ctx = await crypt_context_create();
                this.ctx = ctx;

                let file = (this.mode === 'local') ? this.file : ({ size: await this.getFileSize(this.fileUrl) });
                const fileReader = (this.mode === 'local') ? async (start, end) => {
                    const blob = file.slice(start, end);
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

                const key = this.password;

                await decrypt_stream_init(ctx, new Stream((start, end, signal) => {
                    return fileReader(start, end, signal)
                }, file.size), key);
                // console.log('ctx=', ctx);

                const video = this.$refs.videoPlayer;
                video.controls = true;
                video.playsInline = true;

                this.cleanup = await PlayMp4Video(video, (async (start, end, controller) => {
                    const buffer = await decrypt_stream(ctx, start, end, controller);
                    return buffer;
                }));

                this.$refs.videoDialog.showModal();
            } catch (e) {
                console.error(e);
                alert(e);
                this.playing = false;
            }
        },
        closeDialog() {
            this.$refs.videoDialog.close();
        },
        handleDialogClose() {
            this.playing = false;
            if (this.cleanup) {
                this.cleanup();
                this.cleanup = null;
            }
            crypt_context_destroy(this.ctx);
            // console.log('ctx destroy', this.ctx);
            this.ctx = null;
        }
    }
}
</script>

<style scoped>
.video-decrypt-container {
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

input:not([type="file"]):not([type="radio"]) {
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

video {
    background: black;
}
</style>