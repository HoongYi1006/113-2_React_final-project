/**
 * 行事曆頁面組件 (CalendarPage.tsx)
 * 
 * 功能概述：
 * - 提供月曆視圖的待辦事項管理
 * - 視覺化顯示每日的待辦事項數量和狀態
 * - 支援待辦事項的完整 CRUD 操作
 * - 優先度顏色編碼系統，直觀顯示重要性
 * - 與主頁面的待辦事項資料完全同步
 * 
 * 主要功能：
 * 1. 月曆視圖 - 每日待辦事項概覽
 * 2. 詳細列表 - 選定日期的完整待辦清單
 * 3. 新增/編輯/刪除待辦事項
 * 4. 優先度管理 (高/中/低)
 * 5. 分類管理 (工作/生活/學習等)
 * 6. 時間設定 (支援12/24小時制)
 * 7. 完成狀態切換
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, Typography, Button, List, 
  Calendar, Modal, Form, 
  Select, TimePicker, message, Space, Tag, Input,
  Radio, Checkbox, Progress, Row, Col
} from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { todoService } from '../features/todoService';

// Ant Design 組件解構
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 待辦事項資料結構介面
 */
interface Todo {
  id: number;                // 唯一識別碼
  text: string;             // 待辦事項標題
  description?: string;     // 詳細描述（可選）
  completed: boolean;       // 完成狀態
  date: string;            // 日期 (YYYY-MM-DD 格式)
  time?: string;           // 時間 (HH:mm 格式)
  priority: string;        // 優先級 (high/medium/low)
  category: string;        // 分類 (工作/生活/學習等)
  createdAt: string;       // 建立時間
}

const CalendarPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [form] = Form.useForm();

  // 取得優先級標籤顏色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // 取得優先級背景顏色
  const getPriorityBgColor = (priority: string, completed: boolean) => {
    if (completed) return '#f0f0f0';
    
    switch (priority) {
      case 'high': return '#ffebee'; // 淺紅色
      case 'medium': return '#fff3e0'; // 淺橙色
      case 'low': return '#e8f5e8'; // 淺綠色
      default: return '#e6f7ff'; // 淺藍色
    }
  };

  // 取得優先級文字顏色
  const getPriorityTextColor = (priority: string, completed: boolean) => {
    if (completed) return '#999';
    
    switch (priority) {
      case 'high': return '#d32f2f'; // 紅色
      case 'medium': return '#f57c00'; // 橙色
      case 'low': return '#388e3c'; // 綠色
      default: return '#1890ff'; // 藍色
    }
  };  // 載入選定日期的待辦事項
  const loadTodos = () => {
    const dateStr = selectedDate.format('YYYY-MM-DD');
    // 使用 todoService 取得指定日期的待辦事項
    const dayTodos = todoService.getTodosByDate(dateStr);
    setTodos(dayTodos);
  };useEffect(() => {
    loadTodos();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps
  // 月曆渲染函數
  const dateCellRender = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    // 使用 todoService 取得指定日期的待辦事項
    const dayTodos = todoService.getTodosByDate(dateStr);
    
    if (dayTodos.length === 0) return null;

    return (
      <div style={{ fontSize: '10px' }}>
        {dayTodos.slice(0, 2).map((todo: Todo) => {
          const isCompleted = (todo as any).done || todo.completed;
          const priority = todo.priority || 'medium'; // 確保有預設優先度
          
          return (
            <div 
              key={todo.id} 
              style={{ 
                backgroundColor: getPriorityBgColor(priority, isCompleted),
                borderRadius: '2px',
                padding: '1px 4px',
                margin: '1px 0',
                fontSize: '10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: getPriorityTextColor(priority, isCompleted),
                border: `1px solid ${isCompleted ? '#d9d9d9' : 
                  priority === 'high' ? '#ffcdd2' : 
                  priority === 'medium' ? '#ffe0b2' : 
                  priority === 'low' ? '#c8e6c9' : '#b3d9ff'}`
              }}
            >
              {todo.time && <ClockCircleOutlined style={{ marginRight: 2, fontSize: '8px' }} />}
              {todo.text.slice(0, 6)}...
            </div>
          );
        })}
        {dayTodos.length > 2 && (
          <div style={{ 
            fontSize: '9px', 
            color: '#999', 
            textAlign: 'center' 
          }}>
            +{dayTodos.length - 2}
          </div>
        )}      </div>
    );
  };
  // 新增/編輯待辦事項
  const handleAddOrEdit = (values: any) => {
    const todoData = {
      text: values.text,
      description: values.description || '',
      date: selectedDate.format('YYYY-MM-DD'),
      time: values.time ? values.time.format('HH:mm') : '',
      priority: values.priority || 'medium',
      category: values.category || '生活'
    };

    // 使用 todoService 進行資料操作
    if (editingTodo) {
      todoService.updateTodo(editingTodo.id, todoData);
      message.success('待辦事項已更新');
    } else {
      todoService.addTodo(todoData);
      message.success('待辦事項已新增');
    }

    setIsModalVisible(false);
    setEditingTodo(null);
    form.resetFields();
    loadTodos();
  };// 開啟新增模式
  const handleAdd = () => {
    setEditingTodo(null);
    form.resetFields();
    // 預設當前時間和選定日期
    form.setFieldsValue({
      priority: 'medium',
      category: '生活',
      time: dayjs() // 預設當前時間
    });
    setIsModalVisible(true);
  };

  // 開啟編輯模式
  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    form.setFieldsValue({
      text: todo.text,
      description: todo.description,
      time: todo.time ? dayjs(todo.time, 'HH:mm') : undefined, // 24小時制解析
      priority: todo.priority,
      category: todo.category
    });
    setIsModalVisible(true);
  };  // 刪除待辦事項
  const handleDelete = (todoId: number) => {
    // 使用 todoService 刪除待辦事項
    todoService.deleteTodo(todoId);
    message.success('待辦事項已刪除');
    loadTodos();
  };
  // 切換完成狀態
  const handleToggle = (todoId: number) => {
    // 使用 todoService 切換完成狀態
    todoService.toggleTodo(todoId);
    loadTodos();
  };
  // 排序待辦事項
  const sortedTodos = todos.sort((a, b) => {
    // 先按完成狀態排序
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // 再按時間排序
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    // 最後按優先級排序
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  // 計算選定日期的完成率
  const selectedDateCompletedTodos = todos.filter((todo: Todo) => (todo as any).done || todo.completed).length;
  const selectedDateTotalTodos = todos.length;
  const selectedDateCompletionRate = selectedDateTotalTodos > 0 ? 
    Math.round((selectedDateCompletedTodos / selectedDateTotalTodos) * 100) : 0;
  // 計算本月完成率
  const currentMonth = dayjs().format('YYYY-MM');
  const allTodos = todoService.getAllTodos();
  const monthTodos = allTodos.filter((todo: any) => 
    todo.date && todo.date.startsWith(currentMonth)
  );
  const monthCompletedTodos = monthTodos.filter((todo: any) => todo.completed || todo.done).length;
  const monthTotalTodos = monthTodos.length;
  const monthCompletionRate = monthTotalTodos > 0 ? 
    Math.round((monthCompletedTodos / monthTotalTodos) * 100) : 0;return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>行事曆</Title>
      
      {/* 待辦事項完成率進度條 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} lg={12}>
          <Card title={`${selectedDate.format('MM月DD日')} 待辦事項完成率`} size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Progress 
                type="line" 
                percent={selectedDateCompletionRate}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={(percent) => `${percent}%`}
                style={{ flex: 1 }}
              />
              <Text strong style={{ fontSize: '14px', minWidth: '80px', textAlign: 'right' }}>
                {selectedDateCompletedTodos}/{selectedDateTotalTodos} 項
              </Text>
            </div>
            <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
              {selectedDateTotalTodos === 0 ? '當日尚無待辦事項' : 
               selectedDateCompletionRate === 100 ? '🎉 當日任務全部完成！' :
               selectedDateCompletionRate >= 80 ? '👍 即將完成所有任務' :
               selectedDateCompletionRate >= 50 ? '💪 完成過半，繼續加油' :
               '📝 還有許多任務待完成'}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="本月待辦事項完成率" size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Progress 
                type="line" 
                percent={monthCompletionRate}
                strokeColor={{
                  '0%': '#722ed1',
                  '100%': '#52c41a',
                }}
                format={(percent) => `${percent}%`}
                style={{ flex: 1 }}
              />
              <Text strong style={{ fontSize: '14px', minWidth: '80px', textAlign: 'right' }}>
                {monthCompletedTodos}/{monthTotalTodos} 項
              </Text>
            </div>
            <div style={{ marginTop: '8px', color: '#666', fontSize: '12px' }}>
              {monthTotalTodos === 0 ? '本月尚無待辦事項' : 
               monthCompletionRate === 100 ? '🏆 本月任務全部完成！' :
               monthCompletionRate >= 80 ? '🎯 本月表現優秀' :
               monthCompletionRate >= 60 ? '📈 本月進度良好' :
               '🚀 本月仍有進步空間'}
            </div>
          </Card>
        </Col>
      </Row>
      
      <div className="calendar-container">
        {/* 左側月曆 */}
        <div className="calendar-left">
          <Card style={{ height: '100%' }}>
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={(date) => setSelectedDate(date)}
              value={selectedDate}
            />
          </Card>
        </div>

        {/* 右側待辦事項列表 */}
        <div className="calendar-right">
          <Card 
            style={{ height: '100%' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{selectedDate.format('MM月DD日')}</span>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAdd}
                  size="small"
                >
                  新增
                </Button>
              </div>
            }
          >
            <div style={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
              <List
                size="small"
                dataSource={sortedTodos}                renderItem={(todo) => (                  <List.Item
                    actions={[
                      <Button 
                        key="edit"
                        type="text" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(todo)}
                        size="small"
                      />,
                      <Button 
                        key="delete"
                        type="text" 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDelete(todo.id)}
                        size="small"
                      />
                    ]}
                    style={{ 
                      opacity: ((todo as any).done || todo.completed) ? 0.6 : 1,
                      padding: '12px',
                      margin: '4px 0',
                      borderRadius: '6px',
                      backgroundColor: getPriorityBgColor(todo.priority, (todo as any).done || todo.completed),
                      border: `1px solid ${((todo as any).done || todo.completed) ? '#d9d9d9' : 
                        todo.priority === 'high' ? '#ffcdd2' : 
                        todo.priority === 'medium' ? '#ffe0b2' : 
                        todo.priority === 'low' ? '#c8e6c9' : '#b3d9ff'}`
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ width: '100%' }}>
                          {/* 第一行：checkbox + 文字 */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            marginBottom: '8px',
                            gap: '8px'
                          }}>                            <Checkbox
                              checked={(todo as any).done || todo.completed}
                              onChange={(e) => handleToggle(todo.id)}
                              style={{ 
                                marginTop: '2px',
                                flexShrink: 0
                              }}
                            />
                            <span style={{ 
                              textDecoration: ((todo as any).done || todo.completed) ? 'line-through' : 'none',
                              fontSize: '14px',
                              lineHeight: '1.4',
                              wordBreak: 'break-word',
                              flex: 1
                            }}>
                              {todo.text}
                            </span>                          </div>
                          
                          {/* 第二行：描述 */}
                          {todo.description && (
                            <div style={{ 
                              paddingLeft: '28px',
                              marginBottom: '6px'
                            }}>
                              <Text 
                                type="secondary" 
                                style={{ 
                                  fontSize: '12px',
                                  fontStyle: 'italic'
                                }}
                              >
                                {todo.description}
                              </Text>
                            </div>
                          )}
                          
                          {/* 第三行：標籤 */}
                          {(todo.time || todo.priority) && (
                            <div style={{ 
                              display: 'flex', 
                              gap: '6px', 
                              flexWrap: 'wrap',
                              paddingLeft: '28px' // 對齊文字
                            }}>
                              {todo.time && (
                                <Tag 
                                  icon={<ClockCircleOutlined />} 
                                  color="blue" 
                                  style={{ 
                                    fontSize: '11px',
                                    margin: 0,
                                    height: '20px',
                                    lineHeight: '18px'
                                  }}
                                >
                                  {todo.time}                                </Tag>
                              )}
                              <Tag 
                                color={getPriorityColor(todo.priority)} 
                                style={{ 
                                  fontSize: '11px',
                                  margin: 0,
                                  height: '20px',
                                  lineHeight: '18px'
                                }}
                              >
                                {todo.priority === 'high' ? '高' : 
                                 todo.priority === 'medium' ? '中' : '低'}
                              </Tag>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '這天沒有待辦事項' }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* 新增/編輯待辦事項 Modal */}      <Modal
        title={editingTodo ? '編輯待辦事項' : '新增待辦事項'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTodo(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form 
          form={form} 
          layout="vertical"
          onFinish={handleAddOrEdit}
          initialValues={{
            priority: 'medium'
          }}
        ><Form.Item
            name="text"
            label="標題"
            rules={[{ required: true, message: '請輸入標題' }]}
          >
            <Input placeholder="請輸入待辦事項標題" />
          </Form.Item>
          
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="請輸入詳細描述" />
          </Form.Item><Form.Item name="time" label="具體時間">
            <TimePicker 
              format="h:mm A"
              use12Hours={true}
              placeholder="選擇時間（可選）"
              style={{ width: '100%' }}
            />
          </Form.Item>          <Form.Item name="priority" label="優先級">
            <Radio.Group>
              <Radio value="low">低</Radio>
              <Radio value="medium">中</Radio>
              <Radio value="high">高</Radio>
            </Radio.Group>
          </Form.Item>          <Form.Item name="category" label="分類">
            <Select placeholder="選擇分類">
              <Option value="工作">工作</Option>
              <Option value="生活">生活</Option>
              <Option value="學習">學習</Option>
              <Option value="健康">健康</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTodo ? '更新' : '新增'}
              </Button>
              <Button onClick={() => {
                setIsModalVisible(false);
                setEditingTodo(null);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarPage;
