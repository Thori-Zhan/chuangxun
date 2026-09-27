const assert = require('node:assert/strict');

class LocalStorageMock {
    constructor() { this.data = new Map(); }
    get length() { return this.data.size; }
    key(index) { return [...this.data.keys()][index] ?? null; }
    getItem(key) { return this.data.has(String(key)) ? this.data.get(String(key)) : null; }
    setItem(key, value) { this.data.set(String(key), String(value)); }
    removeItem(key) { this.data.delete(String(key)); }
    clear() { this.data.clear(); }
}

class LocalForageMock {
    constructor() { this.data = new Map(); }
    async keys() { return [...this.data.keys()]; }
    async getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
    async setItem(key, value) { this.data.set(key, value); return value; }
    async clear() { this.data.clear(); }
}

global.window = global;
global.localStorage = new LocalStorageMock();
global.localforage = new LocalForageMock();
global.APP_PREFIX = 'CHAT_APP_V3_';
global.SESSION_ID = 'old-session';
global.JSZip = require('../assets/vendor/jszip.min.js');

require('../js/backup-engine.js');

(async () => {
    const image = 'data:image/png;base64,' + 'A'.repeat(1200);
    const audio = 'data:audio/mpeg;base64,' + 'B'.repeat(1200);
    await localforage.setItem('CHAT_APP_V3_old-session_chatMessages', [{ id: 1, image }]);
    localStorage.setItem('rawImage', image);
    localStorage.setItem('jsonImage', JSON.stringify({ image }));
    localStorage.setItem('rawAudio', audio);

    const flags = {
        inclMsgs: true,
        inclSet: true,
        inclCustom: true,
        inclAnn: true,
        inclThemes: true,
        inclDg: true,
        inclStickers: true
    };
    const payload = await ChatBackup.buildBackupPayload(flags);
    assert.equal(Object.keys(payload.mediaStore).length, 2, '重复媒体应去重，图片和音频应分别保存');

    const zip = new JSZip();
    const mediaIndex = {};
    for (const [mediaId, media] of Object.entries(payload.mediaStore)) {
        const mime = media.slice(5, media.indexOf(';'));
        const bytes = Buffer.from(media.split(',')[1], 'base64');
        zip.file('media/' + mediaId, bytes);
        mediaIndex[mediaId] = { path: 'media/' + mediaId, mime };
    }
    zip.file('backup.json', JSON.stringify({
        type: 'chatapp-backup-v5',
        formatVersion: 5,
        appName: payload.appName,
        timestamp: payload.timestamp,
        sessionId: payload.sessionId,
        appPrefix: payload.appPrefix,
        modules: payload.modules,
        localforage: payload.localforage,
        localStorage: payload.localStorage,
        mediaIndex
    }));

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const parsed = await ChatBackup.loadBackupFromArrayBuffer(
        zipBuffer.buffer.slice(zipBuffer.byteOffset, zipBuffer.byteOffset + zipBuffer.byteLength)
    );

    await localforage.clear();
    localStorage.clear();
    global.SESSION_ID = 'new-session';
    await ChatBackup.applyBackupToStorage(parsed, { selective: false });

    const messages = await localforage.getItem('CHAT_APP_V3_new-session_chatMessages');
    assert.equal(messages[0].image, image, 'IndexedDB 图片应恢复');
    assert.equal(localStorage.getItem('rawImage'), image, '单独保存的图片应恢复为原始值');
    assert.equal(JSON.parse(localStorage.getItem('jsonImage')).image, image, 'JSON 内图片应恢复');
    assert.equal(localStorage.getItem('rawAudio'), audio, '本地音频应恢复');
    console.log('BACKUP_ZIP_RESTORE_OK');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
