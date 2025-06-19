/**
 * ====================================================================
 * 應用程式備用入口檔案 (main.tsx)
 * ====================================================================
 * 
 * 【功能概述】
 * TypeScript 版本的應用程式入口點，提供類型安全的啟動流程
 * 
 * 【與 index.js 的差異】
 * - 使用 TypeScript 提供完整類型檢查
 * - 明確指定 DOM 元素類型 (HTMLElement)
 * - 更嚴格的類型安全保證
 * 
 * 【主要職責】
 * 1. React 應用程式 TypeScript 初始化
 * 2. 類型安全的 DOM 根節點掛載
 * 3. 嚴格模式啟用
 * 
 * 【技術特色】
 * - TypeScript 類型斷言 (as HTMLElement)
 * - React 18 createRoot API
 * - React.StrictMode 開發輔助
 * 
 * @version 1.0.0
 * @lastModified 2024-01-XX
 * ====================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 建立類型安全的 React 根節點並掛載應用程式
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);