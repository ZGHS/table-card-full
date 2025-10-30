import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // 调整为实际的 Prisma 客户端路径
import { z } from "zod";

// 桌牌数据校验规则
const deskSignSchema = z.object({
  signName: z.string().min(1).max(100),
  signCode: z.string().min(1).max(50),
  baseStationId: z.number().int().optional().nullable(),
  status: z.number().int().min(1).max(4).default(1), // 1-正常 2-异常 3-维护中 4-停用
  powerMode: z.number().int().min(1).max(3).default(1), // 1-常亮 2-定时 3-自动休眠
  clearStatus: z.number().int().min(1).max(2).default(1), // 1-已清理 2-未清理
  remark: z.string().max(500).optional().nullable(),
  isDeleted: z.boolean().optional().default(false),
});

// GET: 查询桌牌（单条/多条）
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // 单条查询（ID/编号）
    const id = searchParams.get("id");
    const signCode = searchParams.get("signCode");

    if (id) {
      const deskSign = await prisma.deskSign.findUnique({
        where: { id: Number(id), isDeleted: false },
        include: { baseStation: true },
      });
      return deskSign
        ? NextResponse.json(deskSign)
        : NextResponse.json(null, { status: 404 });
    }

    if (signCode) {
      const deskSign = await prisma.deskSign.findUnique({
        where: { signCode, isDeleted: false },
        include: { baseStation: true },
      });
      return deskSign
        ? NextResponse.json(deskSign)
        : NextResponse.json(null, { status: 404 });
    }

    // 按基站ID查询
    const baseStationId = searchParams.get("baseStationId");
    // 按状态查询
    const status = searchParams.get("status");

    // 多条查询条件
    const whereClause: any = { isDeleted: false };
    if (baseStationId) whereClause.baseStationId = Number(baseStationId);
    if (status) whereClause.status = Number(status);

    // 搜索关键词（名称/编号）
    const keyword = searchParams.get("keyword");
    if (keyword) {
      whereClause.OR = [
        { signName: { contains: keyword } },
        { signCode: { contains: keyword } },
      ];
    }

    const deskSigns = await prisma.deskSign.findMany({
      where: whereClause,
      include: { baseStation: true },
      orderBy: { createTime: "desc" },
    });

    return NextResponse.json(deskSigns);
  } catch (error) {
    console.error("GET 桌牌错误:", error);
    return NextResponse.json(
      { error: "获取桌牌数据失败" },
      { status: 500 }
    );
  }
}

// POST: 创建桌牌
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = deskSignSchema.parse(body);

    // 检查桌牌编号是否已存在
    const existing = await prisma.deskSign.findUnique({
      where: { signCode: validatedData.signCode },
    });
    if (existing) {
      return NextResponse.json(
        { error: "桌牌编号已存在" },
        { status: 400 }
      );
    }

    const newDeskSign = await prisma.deskSign.create({
      data: {
        ...validatedData,
        createTime: new Date(),
        updateTime: new Date(),
      },
      include: { baseStation: true },
    });

    return NextResponse.json(newDeskSign, { status: 201 });
  } catch (error) {
    console.error("POST 桌牌错误:", error);
    return NextResponse.json(
      {
        error:
          "创建桌牌失败" +
          (error instanceof z.ZodError ? ": " + error.message : ""),
      },
      { status: 400 }
    );
  }
}

// PUT: 更新桌牌
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "桌牌ID不能为空" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = deskSignSchema.partial().parse(body);

    // 如果更新编号，检查是否已存在
    if (validatedData.signCode) {
      const existing = await prisma.deskSign.findFirst({
        where: {
          signCode: validatedData.signCode,
          id: { not: Number(id) },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: "桌牌编号已存在" },
          { status: 400 }
        );
      }
    }

    const updatedDeskSign = await prisma.deskSign.update({
      where: { id: Number(id), isDeleted: false },
      data: {
        ...validatedData,
        updateTime: new Date(),
      },
      include: { baseStation: true },
    });

    return NextResponse.json(updatedDeskSign);
  } catch (error) {
    console.error("PUT 桌牌错误:", error);
    return NextResponse.json(
      {
        error:
          "更新桌牌失败" +
          (error instanceof z.ZodError ? ": " + error.message : ""),
      },
      { status: 400 }
    );
  }
}

// DELETE: 删除桌牌（逻辑删除）
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "桌牌ID不能为空" },
        { status: 400 }
      );
    }

    const existing = await prisma.deskSign.findUnique({
      where: { id: Number(id), isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ error: "桌牌不存在" }, { status: 404 });
    }

    // 逻辑删除
    await prisma.deskSign.update({
      where: { id: Number(id) },
      data: { isDeleted: true, updateTime: new Date() },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE 桌牌错误:", error);
    return NextResponse.json(
      { error: "删除桌牌失败" },
      { status: 500 }
    );
  }
}

// 批量更新状态接口
export async function PATCH(request: Request) {
  try {
    const { ids, status } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "请提供有效的桌牌ID列表" },
        { status: 400 }
      );
    }

    if (status === undefined || ![1, 2, 3, 4].includes(status)) {
      return NextResponse.json(
        { error: "请提供有效的状态值(1-4)" },
        { status: 400 }
      );
    }

    await prisma.deskSign.updateMany({
      where: { id: { in: ids.map(Number) }, isDeleted: false },
      data: { status, updateTime: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("批量更新桌牌状态错误:", error);
    return NextResponse.json(
      { error: "批量更新状态失败" },
      { status: 500 }
    );
  }
}

// 处理 OPTIONS 预检请求（跨域用）
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin":
        "http://127.0.0.1:3000, http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
      "Access-Control-Allow-Headers": "*",
    },
  });
}