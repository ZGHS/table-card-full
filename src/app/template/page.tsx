'use client';

import { useState } from 'react';
import { Space } from 'antd';
import ImageGenerator from '../../components/ImageGenerator';
import ResultDisplay from '../../components/ResultDisplay';
import TemplateGallery from '../../components/TemplateGallery';
import PromptTips from '../../components/PromptTips';

export default function ImageGeneratorPage() {
  // 状态管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');

  // 打开生成对话框（支持从模板传入提示词）
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
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: '24px', 
      background: '#fff', 
      borderRadius: 8, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
    }}>
      {/* 页面标题与生成入口 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24, 
        paddingBottom: 16, 
        borderBottom: '1px solid #f0f0f0' 
      }}>
        <button 
          onClick={() => handleOpenModal()}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#165DFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          开始生成图片
        </button>
      </div>

      {/* 核心内容区：结果展示 + 辅助功能 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 生成结果展示区（占比约60%） */}
        <div style={{ 
          padding: 24, 
          background: '#fafafa', 
          borderRadius: 8, 
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ResultDisplay 
            imageUrl={generatedImage} 
            onRegenerate={() => handleOpenModal(currentPrompt)} 
          />
        </div>

        {/* 底部辅助区：模板库 + 提示技巧 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <TemplateGallery onSelectTemplate={handleOpenModal} />
          <PromptTips />
        </div>
      </div>

      {/* 生成对话框（浮层） */}
      <ImageGenerator 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialPrompt={currentPrompt}
        onPromptChange={setCurrentPrompt}
        onImageGenerated={handleImageGenerated}
      />
    </div>
  );
}