import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";
// 引入 Ant Design 核心样式和配置组件
import "antd/dist/reset.css"; // Ant Design 全局样式重置（必须导入）
import { ConfigProvider } from "antd";


export const metadata: Metadata = {
  title: "企业管理系统", // 改为默认标题为业务相关名称
  description: "基于 Next.js + Ant Design 构建的企业级管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="zh-CN">
        <body
          className={`antialiased`}
        >
          <header className="flex justify-end items-center p-4 gap-4 h-16">
          </header>
          {/* Ant Design 全局配置：主题、组件前缀等 */}
          <ConfigProvider
            theme={{
              // 自定义主题（可根据业务需求调整）
              token: {
                colorPrimary: "#1890ff", // Ant Design 经典蓝色主色调
                fontFamily: "var(--font-geist-sans)", // 统一使用 Geist 字体
              },
              // 可选：配置组件默认行为（如按钮默认按钮大小、表单布局等）
              components: {
                Input: {
                  borderRadius: 4, // 输入框圆角
                },
              },
            }}
          >
            {children}{" "}
            <Analytics />
            <SpeedInsights />
            {/* 所有子组件（包括后台布局）都会继承 Ant Design 配置 */}
          </ConfigProvider>
        </body>
      </html>
  );
}
