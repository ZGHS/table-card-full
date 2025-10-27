import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma"; // 导入Prisma客户端实例

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 移除跨域相关代码，通过Next.js配置文件统一配置

  try {
    switch (req.method) {
      // 获取所有基站
      case "GET":
        if (req.query.id) {
          const station = await prisma.baseStation.findUnique({
            where: { id: Number(req.query.id) },
            include: { deskSigns: true },
          });
          return station
            ? res.status(200).json(station)
            : res.status(404).end();
        }

        if (req.query.stationCode) {
          const station = await prisma.baseStation.findUnique({
            where: { stationCode: req.query.stationCode as string },
            include: { deskSigns: true },
          });
          return station
            ? res.status(200).json(station)
            : res.status(404).end();
        }

        if (req.query.ipAddress) {
          const station = await prisma.baseStation.findFirst({
            where: { ipAddress: req.query.ipAddress as string },
            include: { deskSigns: true },
          });
          return station
            ? res.status(200).json(station)
            : res.status(404).end();
        }

        const stations = await prisma.baseStation.findMany({
          where: { isDeleted: false },
          include: { deskSigns: true },
          orderBy: { createTime: "desc" },
        });
        return res.status(200).json(stations);

      // 创建新基站
      case "POST":
        const {
          stationCode,
          stationName,
          ipAddress,
          port,
          bindStatus,
          status,
          remark,
          attributes,
        } = req.body;

        if (!stationCode || !stationName || !ipAddress) {
          return res
            .status(400)
            .json({ error: "基站编号、名称和IP地址为必填项" });
        }

        const newStation = await prisma.baseStation.create({
          data: {
            stationCode,
            stationName,
            ipAddress,
            port: port || null,
            bindStatus: bindStatus || 0,
            status: status || 0,
            remark: remark || null,
            attributes: attributes || null,
            isDeleted: false,
          },
          include: { deskSigns: true },
        });
        return res.status(201).json(newStation);

      // 更新基站
      case "PUT":
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: "基站ID不能为空" });
        }

        const updateData = req.body;
        const updatedStation = await prisma.baseStation.update({
          where: { id: Number(id) },
          data: {
            ...updateData,
            updateTime: new Date(),
          },
          include: { deskSigns: true },
        });
        return res.status(200).json(updatedStation);

      // 删除基站（逻辑删除）
      case "DELETE":
        const deleteId = req.query.id;
        if (!deleteId) {
          return res.status(400).json({ error: "基站ID不能为空" });
        }

        await prisma.baseStation.update({
          where: { id: Number(deleteId) },
          data: { isDeleted: true, updateTime: new Date() },
        });
        return res.status(204).end();

      default:
        res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "OPTIONS"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error("基站API错误:", error);
    return res.status(500).json({ error: "服务器内部错误" });
  }
}
