import { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Select, Collapse, Space, Typography } from 'antd';
import { HfInference } from '@huggingface/inference'; // 需安装：npm i @huggingface/inference

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Text } = Typography;

interface ImageGeneratorProps {
  open: boolean;
  onClose: () => void;
  initialPrompt: string;
  onPromptChange: (prompt: string) => void;
  onImageGenerated: (url: string) => void;
}

// 热门模板（用于对话框内快速选择）
const POPULAR_TEMPLATES = [
  "简约商务名片背景，深蓝色渐变",
  "200x200px圆形图标，白色背景",
  "卡通风格动物头像，扁平化设计"
];

export default function ImageGenerator({ 
  open, 
  onClose, 
  initialPrompt, 
  onPromptChange, 
  onImageGenerated 
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 初始化提示词
  useEffect(() => {
    setPrompt(initialPrompt);
    form.setFieldsValue({ prompt: initialPrompt });
  }, [initialPrompt, form]);

  // 调用Hugging Face API生成图片
  const generateImage = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const hf = new HfInference(process.env.NEXT_PUBLIC_HF_TOKEN); // 环境变量中配置API密钥
      const blob = await hf.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: prompt,
        parameters: { width: 512, height: 512, steps: 20 }
      });
      
      const imageUrl = URL.createObjectURL(blob);
      onImageGenerated(imageUrl);
    } catch (error) {
      console.error('生成失败:', error);
      alert('图片生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="生成图片"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ size: '512x512', count: '1' }}
      >
        {/* 提示词输入区 */}
        <Form.Item
          name="prompt"
          label="请输入提示词"
          rules={[{ required: true, message: '请描述你想要的图片' }]}
        >
          <TextArea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              onPromptChange(e.target.value);
            }}
            rows={4}
            placeholder="例如：红色圆形图标，白色背景，简约风格"
            maxLength={500}
          />
        </Form.Item>

        {/* 模板快捷选择 */}
        <div style={{ margin: '-16px 0 16px' }}>
          <Text type="secondary">不知道怎么写？</Text>
          <Text 
            link 
            onClick={() => {
              // 弹出模板选择（简化处理，实际可做浮层）
              const selected = prompt('选择模板:', POPULAR_TEMPLATES.join('\n'));
              if (selected) setPrompt(selected);
            }}
          >
            从模板选择
          </Text>
        </div>

        {/* 高级选项 */}
        <Collapse defaultActiveKey={[]}>
          <Panel header="更多选项" key="options">
            <Form.Item name="size" label="图片尺寸">
              <Select>
                <Option value="256x256">256x256（快速生成）</Option>
                <Option value="512x512">512x512（推荐）</Option>
                <Option value="1024x1024">1024x1024（高清）</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="count" label="生成数量">
              <Select disabled={loading}>
                <Option value="1">1张</Option>
                <Option value="2">2张</Option>
              </Select>
            </Form.Item>
          </Panel>
        </Collapse>

        {/* 操作按钮 */}
        <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => setPrompt('')} disabled={loading}>
            清除
          </Button>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button 
            type="primary" 
            onClick={generateImage} 
            loading={loading}
          >
            生成图片
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}