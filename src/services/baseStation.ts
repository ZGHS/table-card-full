import type { BaseStation } from '../generated/prisma/client'; // 替换为你的 Prisma 类型或自定义类型

// 基础 API 路径
const API_BASE_URL = '/api/base-stations';

/**
 * 获取所有基站（支持查询参数）
 * @param params 查询参数对象
 * @returns 基站数组
 */
export async function getAllBaseStations(
  params?: Record<string, string | number | boolean>
): Promise<BaseStation[]> {
  try {
    // 构建带查询参数的 URL
    const url = new URL(API_BASE_URL, window.location.origin);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 禁用缓存，确保数据实时性
    });

    if (!response.ok) {
      throw new Error(`获取基站列表失败: ${response.statusText}`);
    }

    const result = await response.json();

    // 处理不同格式的响应数据
    if (Array.isArray(result)) {
      return result;
    }
    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }
    if (result?.items && Array.isArray(result.items)) {
      return result.items;
    }
    if (result?.list && Array.isArray(result.list)) {
      return result.list;
    }

    console.warn('未识别的响应格式，返回空数组');
    return [];
  } catch (error) {
    console.error('获取基站数据时出错:', error);
    throw error; // 抛出错误让调用方处理
  }
}

/**
 * 创建新基站
 * @param data 基站数据（不含 id、createTime、updateTime）
 * @returns 创建的基站对象
 */
export async function createBaseStation(
  data: Omit<BaseStation, 'id' | 'createTime' | 'updateTime'>
): Promise<BaseStation> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `创建基站失败: ${errorData?.message || response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('创建基站时出错:', error);
    throw error; // 抛出错误让调用方处理
  }
}

/**
 * 更新基站
 * @param id 基站 ID
 * @param data 要更新的字段
 * @returns 更新后的基站对象
 */
export async function updateBaseStation(
  id: number,
  data: Partial<Omit<BaseStation, 'id' | 'createTime' | 'updateTime'>>
): Promise<BaseStation> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `更新基站失败: ${errorData?.message || response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('更新基站时出错:', error);
    throw error; // 抛出错误让调用方处理
  }
}

/**
 * 删除基站
 * @param id 基站 ID
 * @returns 是否删除成功
 */
export async function deleteBaseStation(id: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`基站 ${id} 不存在`);
        return false;
      }
      throw new Error(`删除基站失败: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('删除基站时出错:', error);
    throw error; // 抛出错误让调用方处理
  }
}