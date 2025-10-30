"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, message, Modal, Popconfirm } from "antd";
import React, { useRef, useState } from "react";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import ProForm, {
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-form";
import type { DeskSign } from "@/generated/prisma/client";
import {
  getAllDeskSigns as fetchAllDeskSigns,
  createDeskSign as createDeskSignApi,
  updateDeskSign as updateDeskSignApi,
  deleteDeskSign as deleteDeskSignApi,
} from "@/services/deskSign";

// 状态映射配置（移除枚举，直接使用数值）
const statusMap = {
  1: { text: "正常", status: "success" },    // 原NORMAL
  2: { text: "异常", status: "error" },      // 原ABNORMAL
  3: { text: "维护中", status: "warning" },  // 原MAINTENANCE
  4: { text: "停用", status: "default" },    // 原INACTIVE
};

// 电源模式映射配置
const powerModeMap = {
  1: { text: "常亮", status: "success" },    // 原ALWAYS_ON
  2: { text: "定时", status: "warning" },    // 原SCHEDULE
  3: { text: "自动休眠", status: "default" }, // 原AUTO_SLEEP
};

// 清理状态映射配置
const clearStatusMap = {
  1: { text: "已清理", status: "success" },  // 原CLEARED
  2: { text: "未清理", status: "error" },    // 原UNCLEANED
};

// 服务函数封装
async function createDeskSign(data: any): Promise<any | null> {
  try {
    const success = await createDeskSignApi(data);
    if (success) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("创建桌牌失败:", error);
    return null;
  }
}

async function updateDeskSign(id: string, data: any): Promise<any | null> {
  try {
    const success = await updateDeskSignApi(id, data);
    if (success) {
      return { id, ...data };
    }
    return null;
  } catch (error) {
    console.error("更新桌牌失败:", error);
    return null;
  }
}

async function deleteDeskSign(id: string): Promise<boolean> {
  try {
    return await deleteDeskSignApi(id);
  } catch (error) {
    console.error("删除桌牌失败:", error);
    return false;
  }
}

const DeskSignList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const editFormRef = useRef<any>();
  const addFormRef = useRef<any>();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any | null>(null);

  // 定义列配置
  const columns: Array<ProColumns<any>> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      hideInSearch: true,
    },
    {
      title: "桌牌名称",
      dataIndex: "signName",
      width: 150,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入桌牌名称",
          },
        ],
      },
    },
    {
      title: "桌牌编号",
      dataIndex: "signCode",
      width: 150,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入桌牌编号",
          },
        ],
      },
    },
    {
      title: "基站信息",
      dataIndex: ["baseStationDO", "stationName"],
      width: 150,
      hideInSearch: true,
      render: (_, record) => {
        return record.baseStationDO ? record.baseStationDO.stationName : "-";
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      valueEnum: statusMap,
      valueType: "select",
      hideInSearch: true,
      formItemProps: {
        initialValue: 1, // 默认为正常（对应原NORMAL）
      },
    },
    {
      title: "功耗模式",
      dataIndex: "powerMode",
      valueEnum: powerModeMap,
      valueType: "select",
      hideInSearch: true,
    },
    {
      title: "清屏状态",
      dataIndex: "clearStatus",
      valueEnum: clearStatusMap,
      valueType: "select",
      hideInSearch: true,
    },
    {
      title: "备注",
      dataIndex: "remark",
      hideInSearch: true,
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      valueType: "dateTime",
      hideInSearch: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 150,
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            handleEdit(record);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定要删除这个桌牌吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <a key="delete" style={{ color: "#ff4d4f" }}>
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  // 处理编辑
  const handleEdit = (record: any) => {
    setCurrentRecord(record);
    setIsEditModalVisible(true);
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.setFieldsValue(record);
      }
    }, 0);
  };

  // 处理新增
  const handleAdd = () => {
    if (addFormRef.current) {
      addFormRef.current.resetFields();
    }
    setIsAddModalVisible(true);
  };

  // 编辑表单提交
  const handleEditFinish = async (values: any) => {
    try {
      if (currentRecord) {
        const updated = await updateDeskSign(currentRecord.id, values);
        if (updated) {
          message.success("更新成功");
          setIsEditModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error("更新失败");
        }
      }
    } catch (error) {
      message.error(
        "更新失败：" + (error instanceof Error ? error.message : "未知错误")
      );
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      const deleted = await deleteDeskSign(id);
      if (deleted) {
        message.success("删除成功");
        actionRef.current?.reload();
      } else {
        message.error("删除失败");
      }
    } catch (error) {
      message.error(
        "删除失败：" + (error instanceof Error ? error.message : "未知错误")
      );
    }
  };

  // 新增表单提交
  const handleAddFinish = async (values: any) => {
    try {
      const created = await createDeskSign(values);
      if (created) {
        message.success("创建成功");
        setIsAddModalVisible(false);
        actionRef.current?.reload();
      } else {
        message.error("创建失败");
      }
    } catch (error) {
      message.error(
        "创建失败：" + (error instanceof Error ? error.message : "未知错误")
      );
    }
  };

  return (
    <PageContainer>
      <ProTable
        rowKey="id"
        columns={columns}
        search={false}
        request={async (params, sort, filter) => {
          try {
            console.log("查询参数:", params);
            const result = await fetchAllDeskSigns(params);
            
            // 确保返回的数据是数组格式
            const dataArray = Array.isArray(result) ? result : [];
            
            return {
              data: dataArray,
              total: dataArray.length,
            };
          } catch (error) {
            console.error("请求桌牌数据时出错:", error);
            return {
              data: [],
              total: 0,
            };
          }
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增桌牌
          </Button>,
        ]}
        actionRef={actionRef}
        tableAlertOptionRender={({ selectedRowKeys }) => (
          <Popconfirm
            title="确定要删除选中的桌牌吗？"
            onConfirm={async () => {
              for (const id of selectedRowKeys) {
                await deleteDeskSign(String(id));
              }
              message.success("删除成功");
              actionRef.current?.reload();
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger disabled={selectedRowKeys.length === 0}>
              批量删除
            </Button>
          </Popconfirm>
        )}
      />

      {/* 编辑桌牌的Modal */}
      <Modal
        title="编辑桌牌"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setCurrentRecord(null);
        }}
        footer={null}
        width={600}
      >
        <ProForm
          formRef={editFormRef}
          layout="vertical"
          initialValues={currentRecord}
          onFinish={handleEditFinish}
          onCancel={() => {
            setIsEditModalVisible(false);
            setCurrentRecord(null);
          }}
        >
          <ProFormText
            name="signName"
            label="桌牌名称"
            placeholder="请输入桌牌名称"
          />
          <ProFormSelect
            name="status"
            label="状态"
            options={[
              { value: 1, label: "正常" },
              { value: 2, label: "异常" },
              { value: 3, label: "维护中" },
              { value: 4, label: "停用" },
            ]}
          />
          <ProFormSelect
            name="powerMode"
            label="功耗模式"
            options={[
              { value: 1, label: "常亮" },
              { value: 2, label: "定时" },
              { value: 3, label: "自动休眠" },
            ]}
          />
          <ProFormSelect
            name="clearStatus"
            label="清屏状态"
            options={[
              { value: 1, label: "已清理" },
              { value: 2, label: "未清理" },
            ]}
          />
          <ProFormTextArea
            name="remark"
            label="备注"
            placeholder="请输入备注信息"
          />
        </ProForm>
      </Modal>

      {/* 新增桌牌的Modal */}
      <Modal
        title="新增桌牌"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          formRef={addFormRef}
          layout="vertical"
          initialValues={{
            status: 1,         // 默认为正常
            powerMode: 1,      // 默认为常亮
            clearStatus: 1,    // 默认为已清理
          }}
          onFinish={handleAddFinish}
        >
          <ProFormText
            name="signName"
            label="桌牌名称"
            placeholder="请输入桌牌名称"
          />
          <ProFormText
            name="signCode"
            label="桌牌编号"
            placeholder="请输入桌牌编号"
          />
          <ProFormSelect
            name="status"
            label="状态"
            initialValue={1}
            options={[
              { value: 1, label: "正常" },
              { value: 2, label: "异常" },
              { value: 3, label: "维护中" },
              { value: 4, label: "停用" },
            ]}
          />
          <ProFormSelect
            name="powerMode"
            label="功耗模式"
            initialValue={1}
            options={[
              { value: 1, label: "常亮" },
              { value: 2, label: "定时" },
              { value: 3, label: "自动休眠" },
            ]}
          />
          <ProFormSelect
            name="clearStatus"
            label="清屏状态"
            initialValue={1}
            options={[
              { value: 1, label: "已清理" },
              { value: 2, label: "未清理" },
            ]}
          />
          <ProFormTextArea
            name="remark"
            label="备注"
            placeholder="请输入备注信息"
          />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default DeskSignList;
