/**
 * ====================================================================
 * 應用程式頂部導航欄組件 (Header.tsx)
 * ====================================================================
 * 
 * 【功能概述】
 * 提供整個應用程式的頂部導航欄，顯示應用標題與基本資訊
 * 
 * 【主要功能】
 * 1. 應用程式品牌標題顯示
 * 2. 統一的頂部導航設計
 * 3. 未來可擴展用戶資訊、通知等功能
 * 
 * 【設計特色】
 * - 簡潔的白色背景設計
 * - 柔和的陰影效果提升層次感
 * - 響應式佈局適配不同螢幕
 * - 統一的品牌色彩與字體風格
 * 
 * 【UI 結構】
 * - 左側：應用程式標題「生活管理」
 * - 右側：預留空間供未來擴展
 * 
 * 【擴展建議】
 * - 可添加用戶頭像與個人資訊
 * - 可添加通知中心功能
 * - 可添加搜尋功能
 * - 可添加快速操作按鈕
 * 
 * 【技術實現】
 * - 使用 Ant Design Layout.Header 組件
 * - 採用 Flexbox 佈局
 * - 統一的陰影與間距設計
 * 
 * @version 1.0.0
 * @lastModified 2024-01-XX
 * ====================================================================
 */

import React from 'react';
import { Layout, Typography, Space, Avatar } from 'antd';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

/**
 * 頂部導航欄組件
 * 
 * @returns {JSX.Element} 頂部導航欄 UI 組件
 */
const Header: React.FC = () => (
  <AntHeader className="site-header" style={{ padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px #f0f1f2' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>生活管理</Title>
      
    </div>
  </AntHeader>
);

export default Header;
