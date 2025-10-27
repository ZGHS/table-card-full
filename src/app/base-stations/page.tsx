"use client";
import { PlusOutlined } from "@ant-design/icons";
import { Button, message, Modal, Popconfirm } from "antd";
import React, { useRef, useState } from "react";
import { PageContainer } from "@ant-design/pro-layout";
import type { ProColumns, ActionType } from "@ant-design/pro-table";
import ProTable from "@ant-design/pro-table";
import ProForm, { ProFormText, ProFormSelect } from "@ant-design/pro-form";
import type { BaseStation } from "../../generated/prisma/client";
import {
  getAllBaseStations,
  createBaseStation,
  updateBaseStation,
  deleteBaseStation,
} from "../../services/baseStation";

// 1. 在组件顶部的状态定义中添加正确的formRef引用
const BaseStationList: React.FC = () => {
  // 将actionRef移到组件内部
  const actionRef = useRef<ActionType>(null);

  // 添加用于表单的引用
  const editFormRef = useRef<any>(null);
  const addFormRef = useRef<any>(null);

  // 添加状态管理来控制Modal的显示和隐藏
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<BaseStation | null>(null);

  // 定义列配置在组件内部
  const columns: Array<ProColumns<BaseStation>> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      // 在查询条件中隐藏ID字段
      hideInSearch: true,
    },
    {
      title: "基站编号",
      dataIndex: "stationCode",
      width: 120,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入基站编号",
          },
        ],
      },
    },
    {
      title: "基站名称",
      dataIndex: "stationName",
      width: 150,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入基站名称",
          },
        ],
      },
    },
    {
      title: "IP地址",
      dataIndex: "ipAddress",
      // 在查询条件中隐藏IP地址字段
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "请输入IP地址",
          },
        ],
      },
    },
    // 移除不存在的address字段列
    {
      title: "状态",
      dataIndex: "status",
      valueEnum: {
        1: {
          text: "正常",
          status: "Success",
        },
        2: {
          text: "异常",
          status: "Error",
        },
        3: {
          text: "维护中",
          status: "Processing",
        },
        4: {
          text: "停用",
          status: "Default",
        },
      },
      valueType: "select",
      // 在查询条件中隐藏状态字段
      hideInSearch: true,
      formItemProps: {
        initialValue: 1,
      },
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      valueType: "dateTime",
      // 在查询条件中隐藏创建时间字段
      hideInSearch: true,
    },
    {
      title: "更新时间",
      dataIndex: "updateTime",
      valueType: "dateTime",
      // 在查询条件中隐藏更新时间字段
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
          title="确定要删除这个基站吗？"
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

  // 将处理函数也移到组件内部，以便访问actionRef
  // 修改handleEdit函数，使用原生Modal结合ProForm
  const handleEdit = (record: BaseStation) => {
    setCurrentRecord(record);
    setIsEditModalVisible(true);
    // 使用setTimeout确保Modal已经渲染后再设置数据
    setTimeout(() => {
      if (editFormRef.current) {
        editFormRef.current.setFieldsValue(record);
      }
    }, 0);
  };

  // 修改handleAdd函数，使用原生Modal结合ProForm
  const handleAdd = () => {
    // 重置表单数据
    if (addFormRef.current) {
      addFormRef.current.resetFields();
    }
    setIsAddModalVisible(true);
  };

  // 编辑表单的onFinish处理函数
  const handleEditFinish = async (values: any) => {
    try {
      if (currentRecord) {
        console.log("编辑的表单数据:", values);
        const updated = await updateBaseStation(currentRecord.id, values);
        console.log("更新结果:", updated);
        if (updated) {
          message.success("更新成功");
          setIsEditModalVisible(false);
          actionRef.current?.reload();
        } else {
          message.error("更新失败：返回数据为空");
        }
      }
    } catch (error) {
      console.error("更新基站时出错:", error);
      message.error(
        "更新失败：" + (error instanceof Error ? error.message : "未知错误")
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const deleted = await deleteBaseStation(id);
      console.log("删除结果:", deleted);
      if (deleted) {
        message.success("删除成功");
        actionRef.current?.reload();
      } else {
        message.error("删除失败：基站不存在");
      }
    } catch (error) {
      console.error("删除基站时出错:", error);
      message.error(
        "删除失败：" + (error instanceof Error ? error.message : "未知错误")
      );
    }
  };

  // 新增表单的onFinish处理函数
  const handleAddFinish = async (values: any) => {
    try {
      console.log("提交的表单数据:", values);
      const created = await createBaseStation(values);
      console.log("创建结果:", created);
      if (created) {
        message.success("创建成功");
        setIsAddModalVisible(false);
        actionRef.current?.reload();
      } else {
        message.error("创建失败：返回数据为空");
      }
    } catch (error) {
      console.error("创建基站时出错:", error);
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
        // 接收查询参数并传递给getAllBaseStations函数
        request={async (params) => {
          try {
            console.log("查询参数:", params);
            const result = await getAllBaseStations(params);
            console.log("获取到的基站数据:", result);

            // 确保返回的数据是数组格式
            const dataArray = Array.isArray(result) ? result : [];
            console.log("处理后的数据数组长度:", dataArray.length);

            return {
              data: dataArray,
              total: dataArray.length,
            };
          } catch (error) {
            console.error("请求基站数据时出错:", error);
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
            新增基站
          </Button>,
        ]}
        actionRef={actionRef}
        tableAlertOptionRender={({ selectedRowKeys }) => (
          <Popconfirm
            title="确定要删除选中的基站吗？"
            onConfirm={async () => {
              for (const id of selectedRowKeys) {
                await deleteBaseStation(Number(id));
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

      {/* 编辑基站的Modal */}
      <Modal
        title="编辑基站"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          // 清除当前记录，防止下次打开显示错误数据
          setCurrentRecord(null);
        }}
        footer={null}
        width={600}
      >
        <ProForm
          formRef={editFormRef}
          layout="vertical"
          initialValues={currentRecord || undefined}
          onFinish={handleEditFinish}
        >
          <ProFormText
            name="stationCode"
            label="基站编号"
            placeholder="请输入基站编号"
          />
          <ProFormText
            name="stationName"
            label="基站名称"
            placeholder="请输入基站名称"
          />
          <ProFormText
            name="ipAddress"
            label="IP地址"
            placeholder="请输入IP地址"
          />
          {/* 移除address字段 */}
          <ProFormSelect
            name="status"
            label="状态"
            options={[
              { label: "正常", value: 1 },
              { label: "异常", value: 2 },
              { label: "维护中", value: 3 },
              { label: "停用", value: 4 },
            ]}
          />
        </ProForm>
      </Modal>

      {/* 新增基站的Modal */}
      <Modal
        title="新增基站"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={600}
      >
        <ProForm
          formRef={addFormRef}
          layout="vertical"
          initialValues={{ status: 1 }}
          onFinish={handleAddFinish}
        >
          <ProFormText
            name="stationCode"
            label="基站编号"
            placeholder="请输入基站编号"
          />
          <ProFormText
            name="stationName"
            label="基站名称"
            placeholder="请输入基站名称"
          />
          <ProFormText
            name="ipAddress"
            label="IP地址"
            placeholder="请输入IP地址"
          />
          {/* 移除address字段 */}
          <ProFormSelect
            name="status"
            label="状态"
            initialValue={1}
            options={[
              { label: "正常", value: 1 },
              { label: "异常", value: 2 },
              { label: "维护中", value: 3 },
              { label: "停用", value: 4 },
            ]}
          />
        </ProForm>
      </Modal>
    </PageContainer>
  );
};

export default BaseStationList;
