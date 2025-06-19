/**
 * 本地數據存儲工具模組 - 純前端個人財務管理系統
 * 
 * 功能說明：
 * - 提供統一的 localStorage 操作介面
 * - 處理待辦事項、收支記錄、預算等數據
 * - 包含數據驗證、格式化和初始化功能
 * - 完全本地化，無需後端伺服器
 */

/**
 * 本地儲存鍵名常量
 * 使用統一的前綴避免與其他應用衝突
 */
export const STORAGE_KEYS = {
  TODOS: 'finance_todos',           // 待辦事項
  EXPENSES: 'finance_expenses',     // 收支記錄  
  BUDGETS: 'finance_budgets',       // 預算設定
  TEMPLATES: 'finance_templates',   // 常用模板
  SETTINGS: 'finance_settings'      // 用戶設定
};

/**
 * 常用工具函數集合
 * 提供日期、格式化、ID生成等功能
 */
export const utils = {
  /** 取得當前日期字串 (YYYY-MM-DD 格式) */
  getCurrentDate: () => new Date().toISOString().split('T')[0],
  
  /** 取得當前月份字串 (YYYY-MM 格式) */
  getCurrentMonth: () => new Date().toISOString().substring(0, 7),
  
  /** 取得當前時間戳 (ISO 格式) */
  getCurrentTimestamp: () => new Date().toISOString(),
  
  /** 從項目陣列中生成下一個可用的 ID */
  getNextId: (items) => Math.max(0, ...items.map(item => item.id || 0)) + 1,
  
  /** 格式化日期為本地格式 */
  formatDate: (date) => new Date(date).toLocaleDateString('zh-TW'),
  
  /** 格式化金額為台幣格式 */
  formatCurrency: (amount) => new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
};

/**
 * 基礎本地儲存操作
 * 提供安全的讀寫介面和錯誤處理
 */
export const storage = {
  /**
   * 從 localStorage 讀取資料
   * @param {string} key - 儲存鍵名
   * @returns {Array} 解析後的資料陣列，失敗時返回空陣列
   */
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      console.error(`讀取 ${key} 失敗:`, error);
      return [];
    }
  },

  /**
   * 將資料存入 localStorage
   * @param {string} key - 儲存鍵名
   * @param {any} data - 要儲存的資料
   * @returns {boolean} 儲存是否成功
   */
  set: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`保存 ${key} 失敗:`, error);
      return false;
    }
  },
  /**
   * 新增項目到指定儲存空間
   * @param {string} key - 儲存鍵名
   * @param {Object} item - 要新增的項目
   * @returns {Object} 新增後的項目（包含生成的 ID 和時間戳）
   */
  add: (key, item) => {
    const items = storage.get(key);
    const newItem = {
      ...item,
      id: utils.getNextId(items),
      created_at: utils.getCurrentTimestamp()
    };
    items.push(newItem);
    storage.set(key, items);
    return newItem;
  },

  /**
   * 更新指定項目
   * @param {string} key - 儲存鍵名
   * @param {number} id - 項目 ID
   * @param {Object} updates - 要更新的欄位
   * @returns {Object|null} 更新後的項目，失敗時返回 null
   */
  update: (key, id, updates) => {
    const items = storage.get(key);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updates,
        updated_at: utils.getCurrentTimestamp()
      };
      storage.set(key, items);
      return items[index];
    }
    return null;
  },

  /**
   * 刪除指定項目
   * @param {string} key - 儲存鍵名
   * @param {number} id - 項目 ID
   * @returns {boolean} 刪除是否成功
   */
  delete: (key, id) => {
    const items = storage.get(key);
    const filtered = items.filter(item => item.id !== id);
    storage.set(key, filtered);
    return true;
  }
};

/**
 * 初始化應用程式的基礎資料
 * 首次使用時建立空的資料結構和預設設定
 */
export const initializeData = () => {
  // 檢查是否已初始化過
  if (localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    return;
  }
  // 建立預設設定
  const settings = {
    initialized: true,        // 標記已初始化
    version: '2.0',          // 應用版本
    currency: 'TWD',         // 預設貨幣
    created_at: utils.getCurrentTimestamp()
  };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

  // 初始化各種資料為空陣列
  storage.set(STORAGE_KEYS.TODOS, []);      // 待辦事項
  storage.set(STORAGE_KEYS.EXPENSES, []);   // 收支記錄
  storage.set(STORAGE_KEYS.BUDGETS, []);    // 預算設定
  storage.set(STORAGE_KEYS.TEMPLATES, []);  // 常用模板
};

/**
 * 清除所有應用程式資料
 * 用於重置或測試用途，請謹慎使用
 */
export const clearAllData = () => {
  // 清空所有資料
  storage.set(STORAGE_KEYS.TODOS, []);
  storage.set(STORAGE_KEYS.EXPENSES, []);
  storage.set(STORAGE_KEYS.BUDGETS, []);
  storage.set(STORAGE_KEYS.TEMPLATES, []);
  
  // 重新設置初始化標記
  const settings = {
    initialized: true,
    version: '2.0',
    currency: 'TWD',
    created_at: utils.getCurrentTimestamp()
  };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

/**
 * 應用程式載入時自動初始化
 * 確保第一次使用時有正確的資料結構
 */
initializeData();
