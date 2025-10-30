import { useState } from 'react';
import { Button, Space, Empty, Image, message } from 'antd';
import { DownloadOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';

interface ResultDisplayProps {
  imageUrl: string | null;
  onRegenerate: () => void;
}

export default function ResultDisplay({ imageUrl, onRegenerate }: ResultDisplayProps) {
  // 下载图片
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'ai-generated-image.png';
    link.click();
    message.success('下载成功');
  };

  // 继续编辑（模拟）
  const handleEdit = () => {
    if (!imageUrl) return;
    message.info('跳转至编辑页面');
    // 实际项目中跳转至编辑页
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 300 }}>
      {imageUrl ? (
        <>
          {/* 生成的图片 */}
          <div style={{ marginBottom: 24, maxWidth: '100%' }}>
            <Image 
              src={imageUrl} 
              alt="生成结果" 
              preview={{ mask: false }}
              style={{ maxHeight: 400, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </div>

          {/* 操作按钮 */}
          <Space size="middle">
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRegenerate}
            >
              重新生成
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownload}
              type="primary"
            >
              下载图片
            </Button>
            <Button 
              icon={<EditOutlined />} 
              onClick={handleEdit}
              ghost
            >
              继续编辑
            </Button>
          </Space>
        </>
      ) : (
        // 初始空白状态
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div style={{ textAlign: 'center' }}>
              <p>生成的图片将显示在这里</p>
              <Button 
                type="link" 
                onClick={onRegenerate}
                style={{ padding: 0 }}
              >
                点击开始生成
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}