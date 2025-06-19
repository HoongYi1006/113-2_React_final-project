/**
 * 應用程式主組件 (App.tsx)
 * 
 * 功能概述：
 * - 個人財務管理系統的根組件
 * - 設定應用程式的整體佈局與路由
 * - 配置 Ant Design 的主題與本地化
 * - 管理側邊欄、標題列與主內容區域
 * 
 * 架構說明：
 * - 採用 React Router 進行單頁應用路由管理
 * - 使用 Ant Design 作為 UI 組件庫
 * - 響應式設計，支援桌面和行動裝置
 * - 純前端架構，無需後端伺服器
 *  * 路由設定：
 * - / : 主頁面 (Dashboard)
 * - /calendar : 行事曆頁面 (CalendarPage)  
 * - /finance : 財務管理頁面 (FinancePage)
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import FinancePage from './pages/FinancePage';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/es/locale/zh_TW';

/**
 * 應用程式主組件
 * 設定整體佈局、路由和主題配置
 */
const App: React.FC = () => {
  return (
    <ConfigProvider 
      locale={zhTW} 
      theme={{ 
        token: { 
          colorPrimary: '#6366f1' // 設定主色調為紫色
        } 
      }}
    >
      <Router>
        <div className="app-container">
          {/* 側邊欄導航 */}
          <Sidebar />
          
          {/* 主內容區域 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 頂部標題列 */}
            <Header />
            
            {/* 主要內容區 */}
            <main className="main-content">
              <div className="content-box">                {/* 路由配置 */}
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
