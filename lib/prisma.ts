// lib/prisma.ts
import { PrismaClient } from "../src/generated/prisma/client";

// 全局变量存储Prisma实例（开发环境热重载时不会重复创建）
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
