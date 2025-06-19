# 財務與行事曆管理系統 | Finance & Calendar Management System

一個基於 React + TypeScript + Ant Design 的現代化財務與行事曆管理系統，整合收支記錄、待辦事項管理、行事曆規劃等功能。

A modern Finance & Calendar Management System built with React + TypeScript + Ant Design, integrating expense tracking, todo management, and calendar planning features.

## 🚀 功能特色

### 💰 財務管理
- 收支記錄新增、編輯、刪除
- 智慧分類系統（餐飲、交通、娛樂等）
- 月度預算設定與監控
- 收支統計圖表分析
- 類別分佈圓餅圖

### 📋 待辦事項管理
- 待辦事項 CRUD 操作
- 優先級分類（高、中、低）
- 完成狀態切換
- 類別分組管理
- 時間提醒功能

### 📅 行事曆整合
- 待辦事項視覺化
- 日期點擊快速新增
- 優先級顏色標示

### 📊 統計分析
- 月度收支統計
- 待辦事項完成率
- 支出類別分析
- 收支趨勢圖表

## 🛠️ 技術架構

### 前端技術棧
- **React 19.1.0** - 前端框架
- **TypeScript** - 類型安全
- **Ant Design 5.26.0** - UI 組件庫
- **React Router DOM 7.6.0** - 路由管理
- **dayjs 1.11.13** - 日期處理
- **Recharts 2.15.3** - 圖表繪製


### 架構設計
- **組件化架構** - 頁面、佈局、業務組件分離
- **Service 層** - 統一資料操作和業務邏輯
- **Hook 狀態管理** - useState、useEffect 等
- **localStorage 持久化** - 純前端資料存儲
- **響應式設計** - 適配不同螢幕尺寸

## 📁 專案結構

```
src/
├── components/          # 共用組件
│   ├── Header.tsx      # 頂部導航欄
│   └── Sidebar.tsx     # 側邊導航欄
├── pages/              # 頁面組件
│   ├── Dashboard.tsx   # 主控台儀表板
│   ├── FinancePage.tsx # 財務管理頁面
│   └── CalendarPage.tsx # 行事曆頁面
├── features/           # 業務邏輯服務
│   ├── todoService.js  # 待辦事項服務
│   └── expenseService.js # 收支記錄服務
├── App.tsx            # 應用程式根組件
└── index.tsx          # 應用程式入口點
```


## 💡 使用說明

### 主控台 (Dashboard)
- 查看今日收支統計和待辦事項
- 快速新增記帳記錄
- 監控月度完成率和結餘

### 財務管理 (Finance)
- 新增收入/支出記錄
- 設定月度預算
- 查看收支分析圖表
- 支出類別統計

### 行事曆 (Calendar)
- 視覺化待辦事項
- 點擊日期新增待辦
- 優先級顏色標示

## 👨‍💻 開發者

**HoongYi1006**
- GitHub: [@HoongYi1006](https://github.com/HoongYi1006)
