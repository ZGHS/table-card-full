import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Prisma 客户端实例（路径需根据项目结构调整）
import { z } from "zod"; // 用于参数校验（可选，需安装：npm install zod）

// 定义请求参数校验规则（可选，增强类型安全）
const baseStationSchema = z.object({
  stationCode: z.string().min(1).max(50),
  stationName: z.string().min(1).max(100),
  ipAddress: z.string().min(1).max(50),
  port: z.number().int().optional().nullable(),
  bindStatus: z.number().int().min(0).max(1).default(0),
  status: z.number().int().min(0).max(2).default(0),
  remark: z.string().max(500).optional().nullable(),
  attributes: z.string().max(1000).optional().nullable(),
});

// GET 请求：查询基站（支持单条/多条查询）
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // 单条查询（ID/编号/IP）
    const id = searchParams.get("id");
    const stationCode = searchParams.get("stationCode");
    const ipAddress = searchParams.get("ipAddress");

    if (id) {
      const station = await prisma.baseStation.findUnique({
        where: { id: Number(id), isDeleted: false },
        include: { deskSigns: { where: { isDeleted: false } } },
      });
      return station
        ? NextResponse.json(station)
        : NextResponse.json(null, { status: 404 });
    }

    if (stationCode) {
      const station = await prisma.baseStation.findUnique({
        where: { stationCode, isDeleted: false },
        include: { deskSigns: { where: { isDeleted: false } } },
      });
      return station
        ? NextResponse.json(station)
        : NextResponse.json(null, { status: 404 });
    }

    if (ipAddress) {
      const station = await prisma.baseStation.findFirst({
        where: { ipAddress, isDeleted: false },
        include: { deskSigns: { where: { isDeleted: false } } },
      });
      return station
        ? NextResponse.json(station)
        : NextResponse.json(null, { status: 404 });
    }

    // 多条查询（支持搜索参数）
    const stationCodeLike = searchParams.get("stationCode");
    const stationNameLike = searchParams.get("stationName");
    const ipAddressLike = searchParams.get("ipAddress");

    const stations = await prisma.baseStation.findMany({
      where: {
        isDeleted: false,
        stationCode: stationCodeLike
          ? { contains: stationCodeLike }
          : undefined,
        stationName: stationNameLike
          ? { contains: stationNameLike }
          : undefined,
        ipAddress: ipAddressLike ? { contains: ipAddressLike } : undefined,
      },
      include: { deskSigns: { where: { isDeleted: false } } },
      orderBy: { createTime: "desc" },
    });

    return NextResponse.json(stations);
  } catch (error) {
    console.error("GET 基站错误:", error);
    return NextResponse.json({ error: "获取基站数据失败" }, { status: 500 });
  }
}

// POST 请求：创建基站
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 参数校验（可选）
    const validatedData = baseStationSchema.parse(body);

    const newStation = await prisma.baseStation.create({
      data: {
        ...validatedData,
        isDeleted: false,
        createTime: new Date(),
        updateTime: new Date(),
      },
      include: { deskSigns: true },
    });

    return NextResponse.json(newStation, { status: 201 });
  } catch (error) {
    console.error("POST 基站错误:", error);
    return NextResponse.json(
      {
        error:
          "创建基站失败" +
          (error instanceof z.ZodError ? ": " + error.message : ""),
      },
      { status: 400 }
    );
  }
}

// PUT 请求：更新基站
export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "基站ID不能为空" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = baseStationSchema.partial().parse(body); // 部分更新，允许只传修改字段

    const updatedStation = await prisma.baseStation.update({
      where: { id: Number(id), isDeleted: false },
      data: {
        ...validatedData,
        updateTime: new Date(),
      },
      include: { deskSigns: { where: { isDeleted: false } } },
    });

    return NextResponse.json(updatedStation);
  } catch (error) {
    console.error("PUT 基站错误:", error);
    return NextResponse.json(
      {
        error:
          "更新基站失败" +
          (error instanceof z.ZodError ? ": " + error.message : ""),
      },
      { status: 400 }
    );
  }
}

// DELETE 请求：删除基站（逻辑删除）
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "基站ID不能为空" }, { status: 400 });
    }

    // 检查基站是否存在
    const existingStation = await prisma.baseStation.findUnique({
      where: { id: Number(id), isDeleted: false },
    });

    if (!existingStation) {
      return NextResponse.json({ error: "基站不存在" }, { status: 404 });
    }

    // 逻辑删除
    await prisma.baseStation.update({
      where: { id: Number(id) },
      data: { isDeleted: true, updateTime: new Date() },
    });

    // 对于204 No Content状态码，不能提供响应体
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("DELETE 基站错误:", error);
    return NextResponse.json({ error: "删除基站失败" }, { status: 500 });
  }
}

// 处理 OPTIONS 预检请求（跨域用）
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin":
        "http://127.0.0.1:3000, http://localhost:3000",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
