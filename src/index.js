/**
 * ====================================================================
 * 應用程式入口檔案 (index.js)
 * ====================================================================
 * 
 * 【功能概述】
 * React 應用程式的主要入口點，負責初始化與啟動整個個人財務管理系統
 * 
 * 【主要職責】
 * 1. React 應用程式初始化
 * 2. DOM 根節點掛載
 * 3. 嚴格模式啟用 (開發時偵測問題)
 * 4. 效能監控設定
 * 
 * 【技術配置】
 * - 使用 React 18 的 createRoot API
 * - 啟用 React.StrictMode 協助開發除錯
 * - 集成 Web Vitals 效能監控
 * - 引入全域樣式設定
 * 
 * 【檔案結構】
 * - 掛載點：public/index.html 的 #root 元素
 * - 主組件：App.tsx (應用程式主要邏輯)
 * - 樣式：index.css (全域樣式設定)
 * - 監控：reportWebVitals (效能數據收集)
 * 
 * 【開發模式特性】
 * - React.StrictMode 啟用雙重渲染偵測副作用
 * - 提供開發階段的警告與建議
 * - 協助發現過時的 API 使用
 * 
 * @version 1.0.0
 * @lastModified 2024-01-XX
 * ====================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals';

// 建立 React 根節點並掛載應用程式
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 效能監控設定
// 可傳入函數來記錄效能數據 (例如: reportWebVitals(console.log))
// 或發送到分析端點進行監控分析
reportWebVitals();
