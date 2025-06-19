/**
 * Todo Service (todoService.js)
 * 
 * 功能概述：
 * - 集中處理所有待辦事項的 CRUD 操作
 * - 統一管理 localStorage 的資料存取
 * - 提供查詢、過濾、統計等業務邏輯
 * 
 * 設計原則：
 * - 單一職責：只處理待辦事項相關的資料邏輯
 * - 封裝性：隱藏 localStorage 的實作細節
 * - 一致性：統一的 API 介面與錯誤處理
 */

const TODOS_STORAGE_KEY = 'todos';

/**
 * 生成新的 ID
 */
const generateId = () => {
  return Date.now() + Math.random();
};

/**
 * 從 localStorage 載入所有待辦事項
 */
const loadTodos = () => {
  try {
    const todosData = localStorage.getItem(TODOS_STORAGE_KEY);
    return todosData ? JSON.parse(todosData) : [];
  } catch (error) {
    console.error('載入待辦事項失敗:', error);
    return [];
  }
};

/**
 * 儲存待辦事項到 localStorage
 */
const saveTodos = (todos) => {
  try {
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch (error) {
    console.error('儲存待辦事項失敗:', error);
    return false;
  }
};

/**
 * 取得所有待辦事項
 */
export const getAllTodos = () => {
  return loadTodos();
};

/**
 * 根據日期取得待辦事項
 */
export const getTodosByDate = (date) => {
  const todos = loadTodos();
  const dateStr = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
  return todos.filter(todo => todo.date === dateStr);
};

/**
 * 取得今日待辦事項
 */
export const getTodayTodos = () => {
  const today = new Date().toISOString().split('T')[0];
  return getTodosByDate(today);
};

/**
 * 新增待辦事項
 */
export const addTodo = (todoData) => {
  const todos = loadTodos();
  const newTodo = {
    id: generateId(),
    text: todoData.text,
    completed: false,
    date: todoData.date,
    priority: todoData.priority || 'medium',
    category: todoData.category || '其他',
    createdAt: new Date().toISOString(),
    ...todoData
  };
  
  todos.push(newTodo);
  const success = saveTodos(todos);
  return success ? newTodo : null;
};

/**
 * 更新待辦事項
 */
export const updateTodo = (id, updateData) => {
  const todos = loadTodos();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  todos[index] = { ...todos[index], ...updateData };
  const success = saveTodos(todos);
  return success ? todos[index] : null;
};

/**
 * 切換待辦事項完成狀態
 */
export const toggleTodo = (id) => {
  const todos = loadTodos();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  todos[index].completed = !todos[index].completed;
  const success = saveTodos(todos);
  return success ? todos[index] : null;
};

/**
 * 刪除待辦事項
 */
export const deleteTodo = (id) => {
  const todos = loadTodos();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  
  if (filteredTodos.length === todos.length) {
    return false; // 沒有找到要刪除的項目
  }
  
  return saveTodos(filteredTodos);
};

/**
 * 取得待辦事項統計
 */
export const getTodoStats = (date = null) => {
  let todos = loadTodos();
  
  if (date) {
    const dateStr = typeof date === 'string' ? date : date.format('YYYY-MM-DD');
    todos = todos.filter(todo => todo.date === dateStr);
  }
  
  return {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    pending: todos.filter(todo => !todo.completed).length,
    high: todos.filter(todo => todo.priority === 'high').length,
    medium: todos.filter(todo => todo.priority === 'medium').length,
    low: todos.filter(todo => todo.priority === 'low').length
  };
};

/**
 * 根據類別取得待辦事項
 */
export const getTodosByCategory = (category) => {
  const todos = loadTodos();
  return todos.filter(todo => todo.category === category);
};

/**
 * 根據優先度取得待辦事項
 */
export const getTodosByPriority = (priority) => {
  const todos = loadTodos();
  return todos.filter(todo => todo.priority === priority);
};

/**
 * 搜尋待辦事項
 */
export const searchTodos = (keyword) => {
  const todos = loadTodos();
  const lowerKeyword = keyword.toLowerCase();
  return todos.filter(todo => 
    todo.text.toLowerCase().includes(lowerKeyword) ||
    todo.category.toLowerCase().includes(lowerKeyword)
  );
};

/**
 * 清除所有待辦事項
 */
export const clearAllTodos = () => {
  return saveTodos([]);
};

// 預設匯出整個 service 物件
export const todoService = {
  getAllTodos,
  getTodosByDate,
  getTodayTodos,
  addTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
  getTodoStats,
  getTodosByCategory,
  getTodosByPriority,
  searchTodos,
  clearAllTodos
};
