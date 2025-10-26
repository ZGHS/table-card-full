"use client";

import React, { useState, useMemo } from "react";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  OrderedListOutlined, // 稳定图标
  HistoryOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import HomeContent from "./components/HomeContent";
import VideoPage from "./components/VideoPage";

const { Header, Content, Footer, Sider } = Layout;

export default function HomePage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 关键修复：直接初始化选中状态，避免在 useEffect 中更新
  const [selectedKey, setSelectedKey] = useState<string>("4");

  // 缓存菜单项（避免重复渲染）
  const menuItems = useMemo(
    () => [
      {
        key: "1",
        icon: <UserOutlined />,
        label: "用户中心",
      },
      {
        key: "2",
        icon: <VideoCameraOutlined />,
        label: "视频管理",
        children: [
          {
            key: "2-1",
            icon: <OrderedListOutlined />,
            label: "视频列表",
          },
          {
            key: "2-2",
            icon: <HistoryOutlined />,
            label: "上传记录",
          },
        ],
      },
      {
        key: "3",
        icon: <UploadOutlined />,
        label: "文件上传",
      },
      {
        key: "4",
        icon: <HomeOutlined />,
        label: "首页",
      },
    ],
    []
  );

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 32,
            margin: 16,
            background: "#1890ff",
            borderRadius: 4,
          }}
        />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          defaultOpenKeys={[]} // 初始不展开子菜单
        />
      </Sider>
      <Layout>
        {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {getContentByKey(selectedKey)}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}

// 内容映射函数（保持不变）
const getContentByKey = (key: string) => {
  switch (key) {
    case "1":
      return <HomeContent />;
    case "2":
      return <VideoPage />;
    case "2-1":
      return <HomeContent />;
    case "2-2":
      return <div>上传记录内容</div>;
    case "3":
      return <VideoPage />;
    case "4":
      return <HomeContent />;
    default:
      return <HomeContent />;
  }
};
