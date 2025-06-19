/**
 * ====================================================================
 * 應用程式側邊導航欄組件 (Sidebar.tsx)
 * ====================================================================
 * 
 * 【功能概述】
 * 提供整個應用程式的左側導航欄，實現頁面間的快速切換與導航
 * 
 * 【主要功能】
 * 1. 頁面路由導航 - 支援主畫面、行事曆、記帳本三大功能模組
 * 2. 當前頁面高亮顯示 - 透過 React Router 實時追蹤頁面狀態
 * 3. 品牌標識展示 - 頂部顯示應用程式品牌名稱
 * 4. 直覺的圖示設計 - 每個功能模組配置對應圖示
 * 
 * 【導航結構】
 * - 主畫面 (/) - 首頁儀表板，統合展示所有重要資訊
 * - 行事曆 (/calendar) - 待辦事項管理與日程安排
 * - 記帳本 (/finance) - 收支管理、預算控制與財務分析
 * 
 * 【設計特色】
 * - 清爽的白色主題設計
 * - 柔和的陰影效果增強視覺層次
 * - 直覺的圖示語言降低學習成本
 * - 響應式設計適配不同螢幕尺寸
 * - 統一的品牌色彩 (#6366f1) 提升識別度
 * 
 * 【交互體驗】
 * - 點擊導航項目即時切換頁面
 * - 當前頁面自動高亮顯示
 * - 滑鼠懸停提供視覺回饋
 * - 固定寬度 (200px) 提供穩定的導航體驗
 * 
 * 【技術實現】
 * - 使用 React Router 實現單頁應用導航
 * - 使用 useLocation Hook 追蹤當前路由
 * - 使用 Ant Design Menu 組件提供豐富交互
 * - 使用 Link 組件實現無刷新頁面切換
 * 
 * 【擴展性】
 * - 可輕鬆添加新的導航項目
 * - 支援二級選單結構
 * - 可添加摺疊/展開功能
 * - 可集成權限控制機制
 * 
 * @version 1.0.0
 * @lastModified 2024-01-XX
 * ====================================================================
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { HomeOutlined, CalendarOutlined, AccountBookOutlined } from '@ant-design/icons';

const { Sider } = Layout;

/**
 * 側邊導航欄組件
 * 
 * @returns {JSX.Element} 側邊導航欄 UI 組件
 */
const Sidebar: React.FC = () => {
  const location = useLocation();
  
  // 導航選單項目配置
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">主畫面</Link>,
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: <Link to="/calendar">行事曆</Link>,
    },
    {
      key: '/finance',
      icon: <AccountBookOutlined />,
      label: <Link to="/finance">記帳本</Link>,
    }  ];
  
  return (
    <Sider theme="light" width={200} style={{ boxShadow: '2px 0 8px #f0f1f2' }}>
      {/* 品牌標識區域 */}
      <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ margin: 0, color: '#6366f1' }}>MyLifeApp</h2>
      </div>
      
      {/* 導航選單 */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ height: '100%', borderRight: 0 }}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar;
