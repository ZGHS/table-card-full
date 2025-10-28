"use client";

import React, { useState, useMemo } from "react";
import {
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  HomeOutlined,
  OrderedListOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, MenuProps } from "antd";
import HomeContent from "./components/HomeContent";
import VideoPage from "./components/VideoPage";
import BaseStationList from "./base-stations/page";

const { Header, Content, Footer, Sider } = Layout;

// 菜单配置接口
interface MenuItemConfig {
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  children?: MenuItemConfig[];
}

// 集中式菜单配置
const menuConfig: MenuItemConfig[] = [
  {
    label: "用户中心",
    icon: <UserOutlined />,
    content: <HomeContent />,
  },
  {
    label: "设备管理",
    icon: <VideoCameraOutlined />,
    content: <VideoPage />,
    children: [
      {
        label: "基站管理",
        icon: <OrderedListOutlined />,
        content: <BaseStationList />,
      },
      {
        label: "上传记录",
        icon: <HistoryOutlined />,
        content: <div>上传记录内容</div>,
      },
    ],
  },
  {
    label: "文件上传",
    icon: <UploadOutlined />,
    content: <VideoPage />,
  },
  {
    label: "首页",
    icon: <HomeOutlined />,
    content: <HomeContent />,
  },
];

// 1. 明确 MenuData 中 items 为非空数组（核心：排除 undefined）
interface MenuData {
  items: NonNullable<MenuProps["items"]>; // 确保 items 是数组，不是 undefined
  contentMap: Record<string, React.ReactNode>;
  defaultKey: string;
}

// 2. 递归生成菜单数据（通过类型守卫确保 childData.items 非空）
const generateMenuData = (
  config: MenuItemConfig[],
  parentKey = ""
): MenuData => {
  const items: NonNullable<MenuProps["items"]> = [];
  const contentMap: Record<string, React.ReactNode> = {};
  let defaultKey = "";

  config.forEach((item, index) => {
    const currentKey = parentKey
      ? `${parentKey}-${index + 1}`
      : `menu-${index + 1}`;
    if (item.label === "首页") defaultKey = currentKey;
    contentMap[currentKey] = item.content;

    // 处理子菜单：明确返回值的 items 是数组（非 undefined）
    const childData: MenuData = item.children
      ? generateMenuData(item.children, currentKey)
      : { items: [], contentMap: {}, defaultKey: "" }; // 这里明确 items 是数组

    // 3. 类型守卫：确保 childData.items 是数组（消除 undefined 疑虑）
    if (!Array.isArray(childData.items)) {
      throw new Error("Invalid child items: must be an array");
    }

    // 构建菜单项
    const menuItem: NonNullable<MenuProps["items"]>[number] = {
      key: currentKey,
      label: item.label,
      icon: item.icon,
      // 仅当子菜单有内容时才添加 children（用 childData.items.length 确保安全）
      ...(childData.items.length > 0 && { children: childData.items }),
    };

    items.push(menuItem);
    Object.assign(contentMap, childData.contentMap);
  });

  return { items, contentMap, defaultKey };
};

export default function HomePage() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { items, contentMap, defaultKey } = useMemo(() => {
    return generateMenuData(menuConfig);
  }, []);

  const [selectedKey, setSelectedKey] = useState<string>(defaultKey);

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
          items={items}
          onClick={handleMenuClick}
          defaultOpenKeys={[]}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {contentMap[selectedKey]}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
}
