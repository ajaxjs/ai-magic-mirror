import { ipcMain } from 'electron';
import './fun-asr.stt.ts';

ipcMain.on('set-title', (event, title) => {
    console.log('set-title', title);
})