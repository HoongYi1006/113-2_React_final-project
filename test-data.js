// 測試資料生成腳本
// 在瀏覽器控制台中執行，用於測試排行榜功能

const testData = [
  {
    id: Date.now() + 1,
    description: '薪水',
    amount: 50000,
    type: 'income',
    date: '2025-06-01',
    category: '薪資',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 2,
    description: '投資收益',
    amount: 8000,
    type: 'income',
    date: '2025-06-05',
    category: '投資',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 3,
    description: '午餐',
    amount: 150,
    type: 'expense',
    date: '2025-06-01',
    category: '餐飲',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 4,
    description: '晚餐聚會',
    amount: 800,
    type: 'expense',
    date: '2025-06-02',
    category: '餐飲',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 5,
    description: '交通費',
    amount: 200,
    type: 'expense',
    date: '2025-06-03',
    category: '交通',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 6,
    description: '電影票',
    amount: 320,
    type: 'expense',
    date: '2025-06-04',
    category: '娛樂',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 7,
    description: '兼職收入',
    amount: 3000,
    type: 'income',
    date: '2025-06-10',
    category: '兼職',
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 8,
    description: '購物',
    amount: 1200,
    type: 'expense',
    date: '2025-06-12',
    category: '購物',
    createdAt: new Date().toISOString()
  }
];

// 將測試資料儲存到 localStorage
localStorage.setItem('expenses', JSON.stringify(testData));
console.log('測試資料已儲存到 localStorage');
console.log('共', testData.length, '筆記錄');
console.log('收入記錄:', testData.filter(d => d.type === 'income').length, '筆');
console.log('支出記錄:', testData.filter(d => d.type === 'expense').length, '筆');
