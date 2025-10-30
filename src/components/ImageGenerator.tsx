import { useState, useEffect } from 'react';
import { Modal, Input, Button, Form, Select, Collapse, Space, Typography, message } from 'antd';
// 引入新的 InferenceClient（替代 HfInference）
import { InferenceClient } from '@huggingface/inference'; 

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
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // 初始化提示词
  useEffect(() => {
    setCurrentPrompt(initialPrompt);
    // 只有当initialPrompt有值时才设置表单字段值
    if (initialPrompt) {
      form.setFieldsValue({ prompt: initialPrompt });
    }
  }, [initialPrompt]);

  // 初始化新的推理客户端（关键变更）
  const client = new InferenceClient(process.env.NEXT_PUBLIC_HF_TOKEN as string); // 保持原Token不变

  // 生成图片（更新API调用方式）
  const generateImage = async () => {
    if (!currentPrompt.trim()) {
      message.error('请输入提示词');
      return;
    }
    
    setLoading(true);
    try {
      // 调用文生图API（新方法名和参数格式）
      const imageUrl = await client.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: currentPrompt,
        parameters: {
          width: 512,
          height: 512,
          steps: 20,
          guidance_scale: 7.5
        }
      });
      
      onImageGenerated(imageUrl);
      message.success('图片生成成功');
    } catch (error) {
      console.error('生成失败:', error);
      message.error('图片生成失败，请检查提示词或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    // 对话框UI保持不变（省略重复代码）
    <Modal
      title="生成图片"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      maskClosable={false}
    >
      {/* 表单内容与之前一致 */}
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
          onChange={(e) => {
            const newPrompt = e.target.value;
            form.setFieldsValue({ prompt: newPrompt });
            setCurrentPrompt(newPrompt);
            onPromptChange(newPrompt);
          }}
          rows={4}
          placeholder="例如：红色圆形图标，白色背景，简约风格"
          maxLength={500}
        />
      </Form.Item>

        {/* 模板快捷选择 */}
        <div style={{ margin: '-16px 0 16px' }}>
          <Text type="secondary">不知道怎么写？看看下方模板库</Text>
        </div>
        

        {/* 高级选项 */}
        <Collapse 
          defaultActiveKey={[]}
          items={[
            {
              key: 'options',
              label: '更多选项',
              children: (
                <>
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
                </>
              )
            }
          ]}
        />

        {/* 操作按钮 */}
        <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => form.setFieldsValue({ prompt: '' })} disabled={loading}>
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