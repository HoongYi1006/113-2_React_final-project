/**
 * 財務管理頁面組件 (FinancePage.tsx)
 * 
 * 功能概述：
 * - 提供完整的收支記錄管理功能
 * - 支援收支記錄的新增、編輯、刪除操作
 * - 智慧分類系統，自動建議收支類別
 * - 月度預算管理與監控
 * - 豐富的統計圖表與分析功能
 * - 收支趨勢分析與類別佔比
 * 
 * 主要功能：
 * 1. 收支輸入 - 快速記錄收入和支出
 * 2. 類別管理 - 根據收支類型動態顯示分類
 * 3. 資料編輯 - 行內編輯收支記錄
 * 4. 預算追蹤 - 設定月度預算並監控使用率
 * 5. 統計分析 - 月度收支統計與圖表
 * 6. 類別分析 - 支出類別分佈圓餅圖
 * 7. 排行榜 - 最高收入/支出項目排名
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Typography, Button, Input, InputNumber, Radio,
  Select, Table, DatePicker, Form, Statistic, Row, Col,
  Tabs, Tag, Space, Divider, Empty, Progress, Modal, message
} from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { expenseService } from '../features/expenseService';
import { todoService } from '../features/todoService';

// Ant Design 組件解構
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * 收支記錄資料結構介面
 */
interface Expense {
  id: number;                    // 唯一識別碼
  description: string;           // 收支項目描述
  amount: number;               // 金額
  type: 'income' | 'expense';   // 收支類型 (統一為英文)
  date: string;                // 日期 (YYYY-MM-DD 格式)
  category?: string;           // 分類（可選）
}

/**
 * 取得今日日期字串
 * @returns {string} YYYY-MM-DD 格式的今日日期
 */
function getTodayString() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}

/**
 * 取得指定月份的所有日期
 * @param {number} year - 年份
 * @param {number} month - 月份 (0-11)
 * @returns {string[]} 該月所有日期的陣列
 */
function getMonthDays(year: number, month: number) {
  const days: string[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push(date.toISOString().slice(0, 10));
  }
  return days;
}

// 預設收支類別配置
const EXPENSE_CATEGORIES = {
  '餐飲': ['早餐', '午餐', '晚餐', '飲料', '咖啡', '點心', '聚餐'],
  '交通': ['公車', '捷運', '計程車', 'Uber', '油費', '停車費', '高鐵', '火車'],
  '娛樂': ['電影', '唱歌', 'KTV', '遊戲', '旅遊', '看書', '運動'],
  '購物': ['服飾', '鞋子', '包包', '化妝品', '日用品', '家具', '電器'],
  '住宿': ['房租', '水費', '電費', '瓦斯費', '網路費', '管理費', '電話費'],
  '醫療': ['看醫生', '買藥', '健檢', '牙醫', '眼科', '保險'],
  '教育': ['學費', '書籍', '課程', '補習班', '線上課程', '考試報名費'],
  '其他': ['禮品', '捐款', '罰款', '手續費', '其他支出']
};

const INCOME_CATEGORIES = {
  '薪資': ['月薪', '年終獎金', '加班費', '津貼', '獎金'],
  '投資': ['股票收益', '基金收益', '債券收益', '房租收入', '利息'],
  '兼職': ['打工', '接案', '家教', '外送', '臨時工'],
  '其他': ['禮金', '獎金', '退稅', '其他收入']
};

const FinancePage: React.FC = () => {
  const todayStr = getTodayString();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // 月曆狀態
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());  // 編輯狀態
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    description: string;
    amount: string;
    type: 'income' | 'expense';
    date: string;
    category: string;
  }>({
    description: '',
    amount: '',
    type: 'expense',
    date: '',
    category: ''
  });

  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const descriptionInputRef = useRef<HTMLInputElement>(null);  // 月度總計
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthExpenses = expenseService.getAllExpenses().filter((e: any) => e.date.startsWith(monthStr));
  const monthIncome = monthExpenses.filter((e: any) => e.type === 'income').reduce((sum: number, e: any) => sum + e.amount, 0);
  const monthExpense = monthExpenses.filter((e: any) => e.type === 'expense').reduce((sum: number, e: any) => sum + e.amount, 0);

  // 月度總計
  const monthTotal = {
    income: monthIncome,
    expense: monthExpense
  };
  
  // 預算相關狀態
  const [budget, setBudget] = useState<number>(() => {
    const savedBudget = localStorage.getItem(`budget-${monthStr}`);
    return savedBudget ? parseFloat(savedBudget) : 0;
  });
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);
  const [tempBudget, setTempBudget] = useState<string>('');
  
  // 保存預算設置
  const saveBudget = () => {
    if (tempBudget) {
      const budgetValue = parseFloat(tempBudget);
      setBudget(budgetValue);
      localStorage.setItem(`budget-${monthStr}`, budgetValue.toString());
      setShowBudgetModal(false);
    }
  };
  
  // 根據支出和預算計算剩餘預算和使用率
  const budgetRemaining = budget - monthTotal.expense;
  const budgetUsagePercent = budget > 0 ? (monthTotal.expense / budget) * 100 : 0;

  // 變更月份
  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setMonth(newMonth);
    setYear(newYear);
  };  useEffect(() => {
    const allExpenses = expenseService.getAllExpenses();
    setExpenses(allExpenses.filter((e: any) => e.date === selectedDate));
  }, [selectedDate]);
  // 處理類別選擇
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // 清空描述，讓用戶可以選擇具體項目
    setDescription('');
  };

  // 處理具體項目選擇
  const handleItemSelect = (item: string) => {
    setDescription(item);
  };

  // 獲取當前類型的類別
  const getCurrentCategories = () => {
    return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  };
  // 獲取選中類別的具體項目
  const getCategoryItems = (): string[] => {
    const categories = getCurrentCategories();
    return selectedCategory ? (categories as any)[selectedCategory] || [] : [];
  };  const addExpense = () => {
    if (!description || !amount) return;
    
    const expenseData = { 
      description: description,
      amount: Number(amount), 
      type: type,
      date: selectedDate,
      category: selectedCategory || '其他'
    };
    
    // 使用 expenseService 新增記錄
    expenseService.addExpense(expenseData);
    
    // 重新載入選定日期的資料
    const allExpenses = expenseService.getAllExpenses();
    setExpenses(allExpenses.filter((e: any) => e.date === selectedDate));
    
    // 清空表單
    setDescription('');
    setAmount('');
    setSelectedCategory('');
    message.success('新增成功');
    descriptionInputRef.current?.focus();
  };const deleteExpense = (id: number) => {
    // 使用 expenseService 刪除記錄
    expenseService.deleteExpense(id);
    
    // 重新載入選定日期的資料
    const allExpenses = expenseService.getAllExpenses();
    setExpenses(allExpenses.filter((e: any) => e.date === selectedDate));
    
    message.success('記錄已刪除');
  };  // 開始編輯記錄
  const startEdit = (record: Expense) => {
    setEditingId(record.id);
    setEditForm({
      description: record.description,
      amount: record.amount.toString(),
      type: record.type,
      date: record.date,
      category: record.category || ''
    });
  };

  // 取消編輯
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      description: '',
      amount: '',
      type: 'expense',
      date: '',
      category: ''
    });
  };

  // 保存編輯
  const saveEdit = () => {
    if (!editForm.description || !editForm.amount) {
      message.error('請填寫完整資訊');
      return;
    }

    const updateData = {
      description: editForm.description,
      amount: Number(editForm.amount),
      type: editForm.type,
      date: editForm.date,
      category: editForm.category || '其他'
    };
    
    // 使用 expenseService 更新記錄
    const updated = expenseService.updateExpense(editingId!, updateData);
    
    if (updated) {
      // 重新載入選定日期的資料
      const allExpenses = expenseService.getAllExpenses();
      setExpenses(allExpenses.filter((e: any) => e.date === selectedDate));
      
      setEditingId(null);
      message.success('記錄已更新');
    } else {
      message.error('更新失敗');
    }  };
  
  // 載入支出資料
  const loadExpenses = () => {
    const allExpenses = expenseService.getAllExpenses();
    setExpenses(allExpenses.filter((e: any) => e.date === selectedDate));
  };

  // 在組件載入時和日期變化時載入資料
  useEffect(() => {
    loadExpenses();
  }, [selectedDate]);

  // 月曆資料
  const daysInMonth = getMonthDays(year, month);

  // 支出類型分析 - 從現有數據創建自定義分類
  const expenseCategories = React.useMemo(() => {
    const categories = new Map();
    // 預設類別
    const defaultCategories = ['餐飲', '交通', '娛樂', '購物', '住宿', '醫療', '教育', '其他'];
    
    // 初始化預設類別
    defaultCategories.forEach(cat => {
      categories.set(cat, 0);
    });
    
    // 轉換為圖表所需格式
    return Array.from(categories.entries())
      .filter(([_, value]) => value > 0) // 只保留有金額的類別
      .map(([name, value]) => ({ name, value }));
  }, [monthExpenses]);
  
  // 計算類別百分比
  const totalExpenseAmount = expenseCategories.reduce((sum, cat) => sum + cat.value, 0);
  const expenseCategoriesWithPercent = expenseCategories.map(cat => ({
    ...cat,
    percent: totalExpenseAmount > 0 ? (cat.value / totalExpenseAmount * 100).toFixed(1) + '%' : '0%'
  }));
  // 篩選後的資料
  const filteredExpenses = expenses.filter(exp => 
    exp.description.toLowerCase().includes(search.toLowerCase())
  );

  // 日度資料
  const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  const monthlyExpensesList = allExpenses.filter((e: any) => e.date.startsWith(monthStr));
    const dailyData = daysInMonth.map(date => {
    const dayExpenses = monthlyExpensesList.filter((e: any) => e.date === date);
    return {
      date: date.slice(-2),
      income: dayExpenses.filter((e: any) => e.type === 'income').reduce((sum: number, e: any) => sum + e.amount, 0),
      expense: dayExpenses.filter((e: any) => e.type === 'expense').reduce((sum: number, e: any) => sum + e.amount, 0)
    };
  });

  return (
    <div className="finance-page">
      {/* 預算顯示卡片 */}
      <Card title={
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span>月度預算</span>
          <Button type="primary" size="small" onClick={() => {
            setTempBudget(budget.toString());
            setShowBudgetModal(true);
          }}>
            設置預算
          </Button>
        </div>
      } style={{ marginBottom: 16 }} size="small">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="本月預算"
              value={budget}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix="$"
              suffix={budget === 0 ? <Text type="secondary">(未設置)</Text> : ''}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="已用預算"
              value={monthTotal.expense}
              precision={2}
              valueStyle={{ color: monthTotal.expense > budget && budget > 0 ? '#cf1322' : '#000' }}
              prefix="$"
              suffix={
                budget > 0 && 
                  <Text type={monthTotal.expense > budget ? 'danger' : 'secondary'}>
                    ({(monthTotal.expense / budget * 100).toFixed(0)}%)
                  </Text>
              }
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="剩餘預算"
              value={budgetRemaining}
              precision={2}
              valueStyle={{ color: budgetRemaining < 0 ? '#cf1322' : '#3f8600' }}
              prefix="$"
            />
          </Col>
        </Row>
        {budget > 0 && (
          <Progress 
            percent={Math.min(budgetUsagePercent, 100)}
            status={budgetUsagePercent > 100 ? 'exception' : (budgetUsagePercent > 80 ? 'active' : 'normal')}
            strokeColor={
              budgetUsagePercent > 100 ? '#cf1322' : 
              budgetUsagePercent > 80 ? '#faad14' : '#3f8600'
            }
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* 使用 Ant Design 組件的版本 */}
      <Tabs defaultActiveKey="entry" style={{ marginBottom: '8px' }}>
        <TabPane tab="收支輸入" key="entry">
          <Card style={{ marginBottom: '16px' }}>            <Form layout="inline" onFinish={addExpense}>
              <Form.Item label="日期">
                <DatePicker
                  value={dayjs(selectedDate)}
                  onChange={(date) => date && setSelectedDate(date.format('YYYY-MM-DD'))}
                  allowClear={false}
                />
              </Form.Item>              <Form.Item label="類型">
                <Radio.Group
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setSelectedCategory(''); // 切換類型時清空類別選擇
                    setDescription(''); // 清空描述
                  }}
                >
                  <Radio value="income">收入</Radio>
                  <Radio value="expense">支出</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="類別">
                <Select
                  placeholder="選擇類別"
                  value={selectedCategory || undefined}
                  onChange={handleCategoryChange}
                  style={{ width: '120px' }}
                  allowClear
                >
                  {Object.keys(getCurrentCategories()).map(category => (
                    <Option key={category} value={category}>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Form.Item>              {selectedCategory && (
                <Form.Item label="項目">
                  <Select
                    placeholder="選擇項目或手動輸入"
                    value={description || undefined}
                    onChange={handleItemSelect}
                    style={{ width: '150px' }}
                    allowClear
                    showSearch
                    optionFilterProp="children"
                  >{getCategoryItems().map((item: string) => (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}              <Form.Item label="描述">
                <Input
                  placeholder={selectedCategory ? "選擇項目或手動輸入" : "項目描述"}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  ref={descriptionInputRef as any}
                  style={{ width: '150px' }}
                />
              </Form.Item>
              <Form.Item label="金額">
                <InputNumber
                  placeholder="金額"
                  value={amount === '' ? null : Number(amount)}
                  onChange={(value) => setAmount(value ? value.toString() : '')}
                  style={{ width: '120px' }}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  htmlType="submit"
                >
                  新增記錄
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="收支列表">
            <Input.Search
              placeholder="搜尋收支記錄"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 16 }}
            />            <Table
              dataSource={filteredExpenses.map(exp => ({ ...exp, key: exp.id }))}
              columns={[
                {
                  title: '日期',
                  dataIndex: 'date',
                  key: 'date',
                  sorter: (a, b) => a.date.localeCompare(b.date),
                  render: (date, record) => {
                    if (editingId === record.id) {
                      return (
                        <DatePicker
                          size="small"
                          value={dayjs(editForm.date)}
                          onChange={(date) => date && setEditForm({
                            ...editForm,
                            date: date.format('YYYY-MM-DD')
                          })}
                          style={{ width: '100%' }}
                        />
                      );
                    }
                    return date;
                  }
                },                {
                  title: '描述',
                  dataIndex: 'description',
                  key: 'description',                  render: (description, record) => {
                    if (editingId === record.id) {
                      return (
                        <Input
                          size="small"
                          value={editForm.description}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            description: e.target.value
                          })}
                          style={{ width: '100%' }}
                        />
                      );
                    }
                    return description;
                  }
                },
                {
                  title: '類別',
                  dataIndex: 'category',
                  key: 'category',
                  render: (category, record) => {
                    if (editingId === record.id) {
                      return (
                        <Select
                          size="small"
                          value={editForm.category}
                          onChange={(value) => setEditForm({
                            ...editForm,
                            category: value
                          })}
                          style={{ width: '100%' }}
                          placeholder="選擇類別"                        >
                          {Object.keys(editForm.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                            <Option key={cat} value={cat}>
                              {cat}
                            </Option>
                          ))}
                        </Select>
                      );
                    }
                    return category ? <Tag>{category}</Tag> : <Text type="secondary">-</Text>;
                  }
                },
                {
                  title: '金額',
                  dataIndex: 'amount',
                  key: 'amount',
                  sorter: (a, b) => a.amount - b.amount,
                  render: (amount, record) => {
                    if (editingId === record.id) {
                      return (
                        <InputNumber
                          size="small"
                          value={Number(editForm.amount)}
                          onChange={(value) => setEditForm({
                            ...editForm,
                            amount: value ? value.toString() : ''
                          })}
                          style={{ width: '100%' }}
                        />
                      );
                    }                    return (
                      <Text style={{ color: record.type === 'income' ? '#3f8600' : '#cf1322' }}>
                        {record.type === 'income' ? '+' : '-'}{amount}
                      </Text>
                    );
                  },
                },
                {
                  title: '類型',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type, record) => {
                    if (editingId === record.id) {
                      return (
                        <Select
                          size="small"
                          value={editForm.type}
                          onChange={(value) => setEditForm({
                            ...editForm,
                            type: value
                          })}
                          style={{ width: '100%' }}                        >
                          <Option value="income">收入</Option>
                          <Option value="expense">支出</Option>
                        </Select>
                      );
                    }
                    return (
                      <Tag color={type === 'income' ? 'green' : 'red'}>
                        {type === 'income' ? '收入' : '支出'}
                      </Tag>
                    );
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  render: (_, record) => {
                    if (editingId === record.id) {
                      return (
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            icon={<SaveOutlined />}
                            onClick={saveEdit}
                          />
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={cancelEdit}
                          />
                        </Space>
                      );
                    }
                    return (
                      <Space>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => startEdit(record)}
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => deleteExpense(record.id)}
                        />
                      </Space>
                    );
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="月度統計" key="stats">
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space align="center" style={{ marginBottom: '16px' }}>
                  <Button onClick={() => changeMonth(-1)}>上個月</Button>
                  <Title level={4} style={{ margin: 0 }}>
                    {year}年{month + 1}月
                  </Title>
                  <Button onClick={() => changeMonth(1)}>下個月</Button>
                </Space>

                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic
                      title="本月收入"
                      value={monthTotal.income}
                      precision={2}
                      valueStyle={{ color: '#3f8600' }}
                      prefix="$"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="本月支出"
                      value={monthTotal.expense}
                      precision={2}
                      valueStyle={{ color: '#cf1322' }}
                      prefix="$"
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="本月結餘"
                      value={monthTotal.income - monthTotal.expense}
                      precision={2}
                      valueStyle={{ color: monthTotal.income - monthTotal.expense >= 0 ? '#3f8600' : '#cf1322' }}
                      prefix="$"
                    />
                  </Col>
                </Row>

                <Divider />
                
                <Card title="月度趨勢" style={{ marginBottom: 16 }} size="small">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="平均每日收入"
                        value={monthTotal.income / (dailyData.filter((d: any) => d.income > 0).length || 1)}
                        precision={2}
                        valueStyle={{ color: '#3f8600' }}
                        prefix="$"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="平均每日支出"
                        value={monthTotal.expense / (dailyData.filter((d: any) => d.expense > 0).length || 1)}
                        precision={2}
                        valueStyle={{ color: '#cf1322' }}
                        prefix="$"
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="收支比率"
                        value={monthTotal.expense > 0 ? (monthTotal.income / monthTotal.expense * 100) : 0}
                        precision={0}
                        suffix="%"
                        valueStyle={{ color: monthTotal.income > monthTotal.expense ? '#3f8600' : '#cf1322' }}
                      />
                    </Col>
                  </Row>
                </Card>
                  <Card title="收支排行榜" size="small" style={{ marginBottom: 16 }}>
                  <Tabs defaultActiveKey="top-income">
                    <TabPane tab="收入最多" key="top-income">
                      <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                        {monthExpenses
                          .filter((e: any) => e.type === 'income')
                          .sort((a: any, b: any) => b.amount - a.amount)
                          .slice(0, 5)
                          .map((e: any, index: number) => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text>{index + 1}. {e.description} ({e.date})</Text>
                              <Text strong style={{ color: '#3f8600' }}>${e.amount}</Text>
                            </div>
                          ))}
                      </div>
                    </TabPane>
                    <TabPane tab="支出最多" key="top-expense">
                      <div style={{ maxHeight: '150px', overflow: 'auto' }}>
                        {monthExpenses
                          .filter((e: any) => e.type === 'expense')
                          .sort((a: any, b: any) => b.amount - a.amount)
                          .slice(0, 5)
                          .map((e: any, index: number) => (
                            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                              <Text>{index + 1}. {e.description} ({e.date})</Text>
                              <Text strong style={{ color: '#cf1322' }}>${e.amount}</Text>
                            </div>
                          ))}
                      </div>
                    </TabPane>
                  </Tabs>
                </Card>

                <Card title="收支比例圖" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: '收入', value: monthTotal.income },
                          { name: '支出', value: monthTotal.expense }
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell key="收入" fill="#3f8600" />
                        <Cell key="支出" fill="#cf1322" />
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="支出類別分析" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseCategoriesWithPercent}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${percent}`}
                      >
                        {expenseCategoriesWithPercent.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0088FE' : '#00C49F'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`$${value}`, name]} />
                      <Legend layout="vertical" align="right" verticalAlign="middle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </Card>        </TabPane>
      </Tabs>

      {/* 預算設置 Modal */}
      <Modal
        title="設置月度預算"
        open={showBudgetModal}
        onOk={saveBudget}
        onCancel={() => setShowBudgetModal(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form layout="vertical">
          <Form.Item label={`${year}年${month + 1}月預算金額`}>
            <InputNumber
              placeholder="請輸入預算金額"
              value={tempBudget === '' ? null : Number(tempBudget)}
              onChange={(value) => setTempBudget(value ? value.toString() : '')}
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`}
              parser={value => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinancePage;
