/**
 * Expense Service (expenseService.js)
 * 
 * 功能概述：
 * - 集中處理所有收支記錄的 CRUD 操作
 * - 統一管理 localStorage 的資料存取
 * - 提供查詢、統計、分析等業務邏輯
 * 
 * 設計原則：
 * - 單一職責：只處理收支記錄相關的資料邏輯
 * - 封裝性：隱藏 localStorage 的實作細節
 * - 一致性：統一的 API 介面與錯誤處理
 */

const EXPENSES_STORAGE_KEY = 'expenses';

/**
 * 生成新的 ID
 */
const generateId = () => {
  return Date.now() + Math.random();
};

/**
 * 從 localStorage 載入所有收支記錄
 */
const loadExpenses = () => {
  try {
    const expensesData = localStorage.getItem(EXPENSES_STORAGE_KEY);
    return expensesData ? JSON.parse(expensesData) : [];
  } catch (error) {
    console.error('載入收支記錄失敗:', error);
    return [];
  }
};

/**
 * 儲存收支記錄到 localStorage
 */
const saveExpenses = (expenses) => {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch (error) {
    console.error('儲存收支記錄失敗:', error);
    return false;
  }
};

/**
 * 取得所有收支記錄
 */
export const getAllExpenses = () => {
  return loadExpenses();
};

/**
 * 根據日期取得收支記錄
 */
export const getExpensesByDate = (date) => {
  const expenses = loadExpenses();
  const dateStr = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
  return expenses.filter(expense => expense.date === dateStr);
};

/**
 * 取得今日收支記錄
 */
export const getTodayExpenses = () => {
  const today = new Date().toISOString().split('T')[0];
  return getExpensesByDate(today);
};

/**
 * 根據類型取得收支記錄 (income/expense)
 */
export const getExpensesByType = (type) => {
  const expenses = loadExpenses();
  return expenses.filter(expense => expense.type === type);
};

/**
 * 新增收支記錄
 */
export const addExpense = (expenseData) => {
  const expenses = loadExpenses();
  const newExpense = {
    id: generateId(),
    amount: parseFloat(expenseData.amount),
    description: expenseData.description,
    category: expenseData.category,
    type: expenseData.type,
    date: expenseData.date,
    createdAt: new Date().toISOString(),
    ...expenseData
  };
  
  expenses.push(newExpense);
  const success = saveExpenses(expenses);
  return success ? newExpense : null;
};

/**
 * 更新收支記錄
 */
export const updateExpense = (id, updateData) => {
  const expenses = loadExpenses();
  const index = expenses.findIndex(expense => expense.id === id);
  
  if (index === -1) {
    return null;
  }
  
  expenses[index] = { ...expenses[index], ...updateData };
  const success = saveExpenses(expenses);
  return success ? expenses[index] : null;
};

/**
 * 刪除收支記錄
 */
export const deleteExpense = (id) => {
  const expenses = loadExpenses();
  const filteredExpenses = expenses.filter(expense => expense.id !== id);
  
  if (filteredExpenses.length === expenses.length) {
    return false; // 沒有找到要刪除的項目
  }
  
  return saveExpenses(filteredExpenses);
};

/**
 * 取得收支統計 (可指定日期範圍)
 */
export const getExpenseStats = (startDate = null, endDate = null) => {
  let expenses = loadExpenses();
  
  // 如果有指定日期範圍，進行過濾
  if (startDate || endDate) {
    expenses = expenses.filter(expense => {
      const expenseDate = expense.date;
      if (startDate && expenseDate < startDate) return false;
      if (endDate && expenseDate > endDate) return false;
      return true;
    });
  }
  
  const income = expenses.filter(e => e.type === 'income');
  const expense = expenses.filter(e => e.type === 'expense');
  
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expense.reduce((sum, item) => sum + item.amount, 0);
  
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    incomeCount: income.length,
    expenseCount: expense.length,
    totalCount: expenses.length
  };
};

/**
 * 取得今日收支統計
 */
export const getTodayStats = () => {
  const today = new Date().toISOString().split('T')[0];
  return getExpenseStats(today, today);
};

/**
 * 取得月度收支統計
 */
export const getMonthlyStats = (year, month) => {
  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || (now.getMonth() + 1);
  
  const startDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`;
  const lastDay = new Date(targetYear, targetMonth, 0).getDate();
  const endDate = `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
  
  return getExpenseStats(startDate, endDate);
};

/**
 * 根據類別取得收支記錄
 */
export const getExpensesByCategory = (category) => {
  const expenses = loadExpenses();
  return expenses.filter(expense => expense.category === category);
};

/**
 * 取得類別統計
 */
export const getCategoryStats = (type = null) => {
  let expenses = loadExpenses();
  
  if (type) {
    expenses = expenses.filter(expense => expense.type === type);
  }
  
  const categoryStats = {};
  expenses.forEach(expense => {
    if (!categoryStats[expense.category]) {
      categoryStats[expense.category] = {
        count: 0,
        total: 0,
        type: expense.type
      };
    }
    categoryStats[expense.category].count += 1;
    categoryStats[expense.category].total += expense.amount;
  });
  
  return categoryStats;
};

/**
 * 搜尋收支記錄
 */
export const searchExpenses = (keyword) => {
  const expenses = loadExpenses();
  const lowerKeyword = keyword.toLowerCase();
  return expenses.filter(expense => 
    expense.description.toLowerCase().includes(lowerKeyword) ||
    expense.category.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * 取得指定日期範圍的收支記錄
 */
export const getExpensesByDateRange = (startDate, endDate) => {
  const expenses = loadExpenses();
  return expenses.filter(expense => {
    const expenseDate = expense.date;
    return expenseDate >= startDate && expenseDate <= endDate;
  });
};

/**
 * 清除所有收支記錄
 */
export const clearAllExpenses = () => {
  return saveExpenses([]);
};

// 預設匯出整個 service 物件
export const expenseService = {
  getAllExpenses,
  getExpensesByDate,
  getTodayExpenses,
  getExpensesByType,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getTodayStats,
  getMonthlyStats,
  getExpensesByCategory,
  getCategoryStats,
  searchExpenses,
  getExpensesByDateRange,
  clearAllExpenses
};
