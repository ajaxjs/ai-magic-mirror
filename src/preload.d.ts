// src/preload.d.ts

// 定义 electronAPI 的完整类型（根据你实际暴露的 API 填写）
export interface IElectronAPI {
  setTitle: (title: string) => void;
  // 前端 → 后端
  startStream: (prompt?: string) => void;
  cancelStream: () => Promise<{ success: boolean; message: string }>;
  getConfig: () => Promise<any>;

  // 后端 → 前端（事件监听）
  onStreamChunk: (callback: (chunk: string) => void) => void;
  onStreamEnd: (callback: (data: any) => void) => void;
  onStreamError: (callback: (error: string) => void) => void;

  removeAllStreamListeners: () => void;
}

// 全局声明，扩展 Window 接口
declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

// 这行空 export 是为了让文件成为模块（解决 "augmentations for the global scope" 错误）
export {};