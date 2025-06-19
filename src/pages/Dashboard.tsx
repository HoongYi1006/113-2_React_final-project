/**
 * 主頁面組件 (Dashboard.tsx)
 * 
 * 功能概述：
 * - 個人財務管理系統的主控制台
 * - 顯示今日待辦事項與收支概況
 * - 提供快速新增待辦事項和記帳功能
 * - 顯示月度統計與趨勢分析
 * - 純前端設計，所有資料存儲於 localStorage，透過 service 層統一管理
 * 
 * 主要功能：
 * 1. 今日待辦事項管理 (CRUD) - 透過 todoService
 * 2. 今日收支記錄管理 (CRUD) - 透過 expenseService
 * 3. 月度統計資訊顯示
 * 4. 收支類別智慧分類
 * 5. 優先度顏色視覺化
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Statistic, Typography, List, Button, Input, 
  Form, Select, DatePicker, Modal, Checkbox, Tag, Space,
  InputNumber, Radio, message, TimePicker, Progress
} from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { todoService } from '../features/todoService';
import { expenseService } from '../features/expenseService';

// Ant Design 組件解構
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * 支出類別配置
 */
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

/**
 * 收入類別配置
 */
const INCOME_CATEGORIES = {
  '薪資': ['月薪', '年終獎金', '加班費', '津貼', '獎金'],
  '投資': ['股票收益', '基金收益', '債券收益', '房租收入', '利息'],
  '兼職': ['打工', '接案', '家教', '外送', '臨時工'],
  '其他': ['禮金', '獎金', '退稅', '其他收入']
};

// // 型別定義
// interface Todo {
//   id: number;
//   text: string;
//   completed: boolean;
//   date: string;
//   priority: string;
//   category: string;
//   createdAt: string;
// }

// interface Expense {
//   id: number;
//   amount: number;
//   description: string;
//   category: string;
//   type: 'income' | 'expense';
//   date: string;
//   createdAt: string;
// }

const Dashboard: React.FC = () => {
  // 狀態管理
  const [todayExpenses, setTodayExpenses] = useState<any[]>([]);
  const [todayTodos, setTodayTodos] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  // 表單狀態
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<any>(null);

  // 表單欄位
  const [todoForm] = Form.useForm();
  const [expenseForm] = Form.useForm();

  // 取得優先級背景顏色
  const getPriorityBgColor = (priority: string, completed: boolean) => {
    if (completed) return '#f0f0f0';
    
    switch (priority) {
      case 'high': return '#ffebee'; // 淺紅色
      case 'medium': return '#fff3e0'; // 淺橙色
      case 'low': return '#e8f5e8'; // 淺綠色
      default: return '#f6ffed'; // 淺綠色
    }
  };

  // 載入資料
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 使用 service 載入資料
    const todayTodoList = todoService.getTodayTodos();
    const todayExpenseList = expenseService.getTodayExpenses();
    
    setTodayTodos(todayTodoList);
    setTodayExpenses(todayExpenseList);
    
    // 載入本月統計
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const monthStats = expenseService.getMonthlyStats(currentYear, currentMonth);
    const todoStats = todoService.getTodoStats(); // 取得所有待辦統計
    
    setMonthlyStats({
      totalTodos: todoStats.total,
      completedTodos: todoStats.completed,
      totalIncome: monthStats.totalIncome,
      totalExpense: monthStats.totalExpense,
      balance: monthStats.balance
    });

    setLoading(false);
  };

  // 待辦事項操作
  const handleAddTodo = () => {
    setEditingTodo(null);
    todoForm.resetFields();
    // 預設當前時間
    todoForm.setFieldsValue({
      priority: 'medium',
      time: dayjs(),
      category: '生活'
    });
    setTodoModalVisible(true);
  };

  const handleEditTodo = (todo: any) => {
    setEditingTodo(todo);
    todoForm.setFieldsValue({
      title: todo.text, // 表單使用 title，資料儲存為 text
      description: todo.description,
      time: todo.time ? dayjs(todo.time, 'HH:mm') : undefined,
      priority: todo.priority,
      category: todo.category
    });
    setTodoModalVisible(true);
  };

  const handleSaveTodo = async (values: any) => {
    try {
      // 使用 todoService 進行資料操作
      const todoData = {
        text: values.title,
        description: values.description || '',
        date: dayjs().format('YYYY-MM-DD'),
        time: values.time ? values.time.format('HH:mm') : '',
        priority: values.priority || 'medium',
        category: values.category || '生活'
      };

      if (editingTodo) {
        todoService.updateTodo(editingTodo.id, todoData);
        message.success('待辦事項已更新');
      } else {
        todoService.addTodo(todoData);
        message.success('待辦事項已新增');
      }

      setTodoModalVisible(false);
      todoForm.resetFields();
      loadData();
    } catch (error) {
      console.error('操作失敗:', error);
      message.error('操作失敗');
    }
  };

  const handleToggleTodo = (todoId: number) => {
    // 使用 todoService 切換狀態
    todoService.toggleTodo(todoId);
    loadData();
    message.success('狀態已更新');
  };

  const handleDeleteTodo = (todoId: number) => {
    // 使用 todoService 刪除
    todoService.deleteTodo(todoId);
    loadData();
    message.success('待辦事項已刪除');
  };  // 收支操作 - 僅保留刪除功能和快速記帳
  const handleQuickExpense = async (values: any) => {
    try {
      // 使用 expenseService 進行資料操作
      const expenseData = {
        description: values.description,
        amount: parseFloat(values.amount) || 0,
        category: values.category || '其他',
        type: values.type,
        date: values.date.format('YYYY-MM-DD')
      };

      expenseService.addExpense(expenseData);
      message.success('記帳記錄已新增');

      expenseForm.resetFields();
      expenseForm.setFieldsValue({
        type: 'expense',
        date: dayjs()
      });
      loadData();
    } catch (error) {
      console.error('操作失敗:', error);
      message.error('操作失敗');
    }
  };

  const handleDeleteExpense = (expenseId: number) => {
    // 使用 expenseService 刪除
    expenseService.deleteExpense(expenseId);
    loadData();
    message.success('記帳記錄已刪除');
  };

  // 計算今日統計
  const todayIncome = todayExpenses
    .filter((expense: any) => expense.type === 'income')
    .reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const todayExpense = todayExpenses
    .filter((expense: any) => expense.type === 'expense')
    .reduce((sum: number, expense: any) => sum + expense.amount, 0);

  const todayBalance = todayIncome - todayExpense;

  // 待辦事項統計
  const todayCompletedTodos = todayTodos.filter((todo: any) => todo.completed || todo.done).length;
  const todayTotalTodos = todayTodos.length;
  const todayCompletionRate = todayTotalTodos > 0 ? Math.round((todayCompletedTodos / todayTotalTodos) * 100) : 0;

  // 月度完成率
  const monthlyCompletionRate = monthlyStats.totalTodos > 0 ?
    Math.round((monthlyStats.completedTodos / monthlyStats.totalTodos) * 100) : 0;

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>載入中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>今日概覽</Title>
      
      {/* 統計卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={todayIncome}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日支出"
              value={todayExpense}
              prefix={<ShoppingCartOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日結餘"
              value={todayBalance}
              prefix={<DollarOutlined />}
              valueStyle={{ color: todayBalance >= 0 ? '#52c41a' : '#f5222d' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日待辦完成率"
              value={todayCompletionRate}
              suffix="%"
              valueStyle={{ color: todayCompletionRate > 50 ? '#52c41a' : '#faad14' }}
            />
            <Progress 
              percent={todayCompletionRate} 
              size="small"
              strokeColor={todayCompletionRate > 50 ? '#52c41a' : '#faad14'}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 今日待辦事項 */}
        <Col span={12}>
          <Card 
            title="今日待辦事項"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddTodo}
              >
                新增
              </Button>
            }
          >
            {todayTodos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                今日沒有待辦事項
              </div>
            ) : (
              <List
                dataSource={todayTodos}
                renderItem={(todo: any) => (
                  <List.Item
                    style={{
                      backgroundColor: getPriorityBgColor(todo.priority, todo.completed),
                      padding: '12px',
                      marginBottom: '8px',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}
                    actions={[
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEditTodo(todo)}
                      />,
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTodo(todo.id)}
                      />
                    ]}
                  >
                    <div style={{ flex: 1 }}>
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id)}
                        style={{ marginRight: '8px' }}
                      />
                      <span
                        style={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? '#999' : '#000'
                        }}
                      >
                        {todo.text}
                      </span>
                      <div style={{ marginTop: '4px' }}>
                        <Tag color={todo.priority === 'high' ? 'red' : todo.priority === 'medium' ? 'orange' : 'green'}>
                          {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                        </Tag>
                        <Tag>{todo.category}</Tag>
                        {todo.time && (
                          <Tag icon={<ClockCircleOutlined />}>{todo.time}</Tag>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>        {/* 今日收支記錄 */}
        <Col span={12}>
          {/* 快速記帳表單 */}
          <Card title="快速記帳" style={{ marginBottom: '16px' }}>
            <Form
              form={expenseForm}
              layout="inline"
              onFinish={handleQuickExpense}
              initialValues={{
                type: 'expense',
                date: dayjs()
              }}
            >
              <Form.Item
                name="date"
                label="日期"
                rules={[{ required: true, message: '請選擇日期' }]}
              >
                <DatePicker allowClear={false} />
              </Form.Item>

              <Form.Item
                name="type"
                label="類型"
                rules={[{ required: true, message: '請選擇類型' }]}
              >
                <Radio.Group>
                  <Radio value="income">收入</Radio>
                  <Radio value="expense">支出</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="category" label="類別">
                <Select 
                  placeholder="選擇類別" 
                  allowClear
                  style={{ width: '120px' }}
                >
                  <Option value="餐飲">餐飲</Option>
                  <Option value="交通">交通</Option>
                  <Option value="娛樂">娛樂</Option>
                  <Option value="購物">購物</Option>
                  <Option value="住宿">住宿</Option>
                  <Option value="醫療">醫療</Option>
                  <Option value="教育">教育</Option>
                  <Option value="薪資">薪資</Option>
                  <Option value="投資">投資</Option>
                  <Option value="兼職">兼職</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="描述"
                rules={[{ required: true, message: '請輸入描述' }]}
              >
                <Input 
                  placeholder="項目描述" 
                  style={{ width: '150px' }}
                />
              </Form.Item>

              <Form.Item
                name="amount"
                label="金額"
                rules={[{ required: true, message: '請輸入金額' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  placeholder="金額"
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
          </Card>          <Card 
            title="今日收支記錄"
          >
            {todayExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                今日沒有收支記錄
              </div>
            ) : (
              <List
                dataSource={todayExpenses}
                renderItem={(expense: any) => (
                  <List.Item                    actions={[
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteExpense(expense.id)}
                      />
                    ]}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{expense.description}</span>
                        <span
                          style={{
                            color: expense.type === 'income' ? '#52c41a' : '#f5222d',
                            fontWeight: 'bold'
                          }}
                        >
                          {expense.type === 'income' ? '+' : '-'}${expense.amount}
                        </span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <Tag color={expense.type === 'income' ? 'green' : 'red'}>
                          {expense.type === 'income' ? '收入' : '支出'}
                        </Tag>
                        <Tag>{expense.category}</Tag>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 月度統計 */}
      <Row style={{ marginTop: '24px' }}>
        <Col span={24}>
          <Card title="本月統計">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="本月收入"
                  value={monthlyStats.totalIncome || 0}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="本月支出"
                  value={monthlyStats.totalExpense || 0}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="本月結餘"
                  value={monthlyStats.balance || 0}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: (monthlyStats.balance || 0) >= 0 ? '#52c41a' : '#f5222d' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="待辦完成率"
                  value={monthlyCompletionRate}
                  suffix="%"
                  valueStyle={{ color: monthlyCompletionRate > 50 ? '#52c41a' : '#faad14' }}
                />
                <Progress 
                  percent={monthlyCompletionRate} 
                  size="small"
                  strokeColor={monthlyCompletionRate > 50 ? '#52c41a' : '#faad14'}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 待辦事項 Modal */}
      <Modal
        title={editingTodo ? "編輯待辦事項" : "新增待辦事項"}
        open={todoModalVisible}
        onCancel={() => setTodoModalVisible(false)}
        footer={null}
      >
        <Form
          form={todoForm}
          layout="vertical"
          onFinish={handleSaveTodo}
        >
          <Form.Item
            name="title"
            label="待辦事項"
            rules={[{ required: true, message: '請輸入待辦事項' }]}
          >
            <Input placeholder="請輸入待辦事項" />
          </Form.Item>

          <Form.Item name="description" label="詳細描述">
            <TextArea rows={3} placeholder="詳細描述（可選）" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="優先級">
                <Select>
                  <Option value="high">高</Option>
                  <Option value="medium">中</Option>
                  <Option value="low">低</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="分類">
                <Select>
                  <Option value="工作">工作</Option>
                  <Option value="生活">生活</Option>
                  <Option value="學習">學習</Option>
                  <Option value="健康">健康</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="time" label="時間">
            <TimePicker format="HH:mm" placeholder="選擇時間" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTodo ? '更新' : '新增'}
              </Button>
              <Button onClick={() => setTodoModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>    </div>
  );
};

export default Dashboard;
