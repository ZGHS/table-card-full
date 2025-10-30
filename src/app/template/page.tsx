'use client';

import { useState } from 'react';
import { Layout, Button, Space } from 'antd';
import ImageGenerator from '../../components/ImageGenerator';
import ResultDisplay from '../../components/ResultDisplay';
import TemplateGallery from '../../components/TemplateGallery';
import PromptTips from '../../components/PromptTips';

const { Header, Content, Footer } = Layout;

export default function Template() {
  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');

  // 打开生成对话框
  const handleOpenModal = (prompt?: string) => {
    if (prompt) setCurrentPrompt(prompt);
    setIsModalOpen(true);
  };

  // 接收生成结果
  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImage(imageUrl);
    setIsModalOpen(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部区域 */}
      <Header style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#165DFF' }}>AI 图片生成器</h1>
          <Button 
            type="primary" 
            size="large" 
            onClick={() => handleOpenModal()}
            style={{ borderRadius: 8 }}
          >
            开始生成
          </Button>
        </div>
      </Header>

      {/* 中部内容区 */}
      <Content style={{ maxWidth: 1200, margin: '24px auto', width: '100%', padding: '0 24px' }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 32, minHeight: 400 }}>
          {/* 结果展示区 */}
          <ResultDisplay 
            imageUrl={generatedImage} 
            onRegenerate={() => handleOpenModal(currentPrompt)} 
          />
        </div>

        {/* 底部辅助区 */}
        <div style={{ marginTop: 24 }}>
          {/* 公共模板库 */}
          <TemplateGallery onSelectTemplate={handleOpenModal} />
          
          {/* 提示词技巧 */}
          <PromptTips style={{ marginTop: 24 }} />
        </div>
      </Content>

      {/* 生成对话框 */}
      <ImageGenerator 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialPrompt={currentPrompt}
        onImageGenerated={handleImageGenerated}
        onPromptChange={setCurrentPrompt}
      />
    </Layout>
  );
}