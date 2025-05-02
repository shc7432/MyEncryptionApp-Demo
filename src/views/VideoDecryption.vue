<template>
    <div class="video-decrypt-container">
        <input type="file" @change="handleFileSelect" />
        <input type="password" v-model="password" placeholder="输入解密密码" />
        <button @click="playVideo" :disabled="!file || playing">播放视频</button>

        <dialog style="width: 100%; height: 100%; display: flex; flex-direction: column;" ref="videoDialog" @close="handleDialogClose">
            <video v-if="playing" ref="videoPlayer" controls style="flex: 1;"></video>
            <button @click="closeDialog" style="margin-top: 0.5em;">关闭</button>
        </dialog>
    </div>
</template>

<script>
import { Stream, crypt_context_create, crypt_context_destroy, decrypt_stream_init, decrypt_stream } from '../../lib/encryption/main.bundle.js';
import { PlayMp4Video, setLogEnabled } from '../play_video.js';

export default {
    name: 'VideoDecryption',
    data() {
        return {
            ctx: null,
            file: null,
            password: '',
            playing: false,
            cleanup: null,
        }
    },

    methods: {
        handleFileSelect(event) {
            this.file = event.target.files[0];
        },
        async playVideo() {
            try {
                this.playing = true;
                await this.$nextTick(); // Wait for DOM update

                const ctx = await crypt_context_create();
                this.ctx = ctx;

                const file = this.file;
                const fileReader = async (start, end) => {
                    const blob = file.slice(start, end);
                    return new Uint8Array(await blob.arrayBuffer());
                };

                const key = this.password;

                await decrypt_stream_init(ctx, new Stream((start, end) => {
                    return fileReader(start, end)
                }), file.size, key);
                console.log('ctx=', ctx);

                const video = this.$refs.videoPlayer;
                video.controls = true;
                let ms;
                await new Promise((resolve) => {
                    ms = new MediaSource();
                    video.src = URL.createObjectURL(ms);
                    ms.addEventListener('sourceopen', () => {
                        resolve()
                    }, { once: true });
                });

                this.cleanup = await PlayMp4Video(video, ms, (async (start, end) => {
                    const buffer = await decrypt_stream(ctx, start, end);
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
            console.log('ctx destroy', this.ctx);
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
</style>