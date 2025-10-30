import { Collapse, Typography } from 'antd';

const { Text, Title } = Typography;

export default function PromptTips() {
  const collapseItems = [
    {
      key: '1',
      label: '如何写出更精准的提示词？',
      children: (
        <ul style={{ paddingLeft: 20 }}>
          <li>
            <Text strong>明确尺寸</Text>：例如“生成200×200px的圆形图标”
          </li>
          <li>
            <Text strong>指定风格</Text>：例如“简约扁平风，低饱和度配色”
          </li>
          <li>
            <Text strong>补充细节</Text>：例如“商务名片背景，深蓝色渐变，底部有细线条装饰”
          </li>
        </ul>
      ),
    },
  ];

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 24 }}>
      <Title level={4} style={{ margin: 0 }}>提示词技巧</Title>
      
      <Collapse 
        defaultActiveKey={['1']} 
        style={{ marginTop: 16 }}
        items={collapseItems}
      />
    </div>
  );
}