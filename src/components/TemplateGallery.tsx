import { useState } from 'react';
import { Card, Tabs, Row, Col, Typography, Space, Divider, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 模板数据
const TEMPLATES = {
  '名片背景': [
    { id: 1, prompt: '商务名片背景，灰色渐变，底部细线条装饰', preview: '/template1.jpg' },
    { id: 2, prompt: '简约名片背景，浅蓝色，左上角留白', preview: '/template2.jpg' },
  ],
  '图标设计': [
    { id: 3, prompt: '200x200px圆形图标，白色背景，黑色线条', preview: '/template3.jpg' },
    { id: 4, prompt: '方形logo，渐变色，极简风格', preview: '/template4.jpg' },
  ],
  '简约风格': [
    { id: 5, prompt: '纯白背景，单一线条勾勒的物体', preview: '/template5.jpg' },
    { id: 6, prompt: '低饱和度配色，几何图形组合', preview: '/template6.jpg' },
  ]
};

interface TemplateGalleryProps {
  onSelectTemplate: (prompt: string) => void;
}

export default function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const [activeKey, setActiveKey] = useState('名片背景');

  // 刷新模板（模拟）
  const handleRefresh = () => {
    // 实际项目中可调用API加载新模板
    console.log('刷新模板');
  };

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>公共模板库</Title>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
          换一批
        </Button>
      </Space>

      <Divider style={{ margin: '16px 0' }} />

      <Tabs 
        activeKey={activeKey} 
        onChange={setActiveKey}
        style={{ marginBottom: 16 }}
      >
        {Object.keys(TEMPLATES).map((key) => (
          <TabPane tab={key} key={key} />
        ))}
      </Tabs>

      {/* 模板卡片列表 */}
      <Row gutter={[16, 16]}>
        {TEMPLATES[activeKey as keyof typeof TEMPLATES].map((template) => (
          <Col xs={24} sm={12} md={8} key={template.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: 120, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* 实际项目中替换为真实预览图 */}
                  <img 
                    src={template.preview} 
                    alt="模板预览" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              }
              onClick={() => onSelectTemplate(template.prompt)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid #eee' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <Card.Meta 
                description={
                  <Text ellipsis={{ rows: 2, expandable: true, symbol: '显示全部' }}>
                    {template.prompt}
                  </Text>
                } 
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}