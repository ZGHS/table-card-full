import type { DeskSign } from '../generated/prisma/client'; // 替换为你的 Prisma 类型或自定义类型

// 基础API路径
const API_BASE_URL = '/api/desk-signs';

/**
 * 获取所有桌牌列表
 */
export async function getAllDeskSigns(params?: Record<string, string | number | boolean>): Promise<DeskSign[]> {                                    
  try {
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
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`获取桌牌列表失败: ${response.statusText}`);
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
    console.error('获取桌牌数据时出错:', error);
    throw error;
  }
}

/**
 * 根据ID获取桌牌
 */
export async function getDeskSignById(id: string | number): Promise<DeskSign | null> {
  try {
    const url = new URL(API_BASE_URL, window.location.origin);
    url.searchParams.append('id', String(id));
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`获取桌牌失败: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`获取桌牌(ID:${id})失败:`, error);
    throw error;
  }
}

/**
 * 根据基站ID获取桌牌列表
 */
export async function getDeskSignsByBaseStationId(baseStationId: string | number): Promise<DeskSign[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/base-station/${baseStationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`获取基站桌牌列表失败: ${response.statusText}`);
    }

    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error(`根据基站ID获取桌牌列表失败:`, error);
    throw error;
  }
}

/**
 * 创建桌牌
 */
export async function createDeskSign(deskSignData: Partial<DeskSign>): Promise<DeskSign> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deskSignData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`创建桌牌失败: ${errorData?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('创建桌牌失败:', error);
    throw error;
  }
}

/**
 * 更新桌牌
 */
export async function updateDeskSign(id: string | number, deskSignData: Partial<DeskSign>): Promise<DeskSign> {
  try {
    const url = new URL(API_BASE_URL, window.location.origin);
    url.searchParams.append('id', String(id));
    
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deskSignData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`更新桌牌失败: ${errorData?.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`更新桌牌(ID:${id})失败:`, error);
    throw error;
  }
}

/**
 * 删除桌牌
 */
export async function deleteDeskSign(id: string | number): Promise<boolean> {
  try {
    const url = new URL(API_BASE_URL, window.location.origin);
    url.searchParams.append('id', String(id));
    
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return false;
      }
      throw new Error(`删除桌牌失败: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`删除桌牌(ID:${id})失败:`, error);
    throw error;
  }
}

/**
 * 批量更新桌牌状态
 */
export async function batchUpdateDeskSignStatus(ids: (string | number)[], status: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/batch-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids, status }),
    });

    if (!response.ok) {
      throw new Error(`批量更新桌牌状态失败: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('批量更新桌牌状态失败:', error);
    throw error;
  }
}