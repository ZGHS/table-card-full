-- CreateTable
CREATE TABLE "device_base_station" (
    "id" SERIAL NOT NULL,
    "stationCode" TEXT NOT NULL,
    "stationName" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER,
    "bindStatus" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 0,
    "lastOnlineTime" TIMESTAMP(3),
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "attributes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "siteId" INTEGER,

    CONSTRAINT "device_base_station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_desk_sign" (
    "id" SERIAL NOT NULL,
    "signCode" TEXT NOT NULL,
    "signName" TEXT NOT NULL,
    "baseStationId" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 0,
    "powerMode" INTEGER NOT NULL DEFAULT 1,
    "clearStatus" INTEGER NOT NULL DEFAULT 0,
    "lastContentTime" TIMESTAMP(3),
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "attributes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "siteId" INTEGER,

    CONSTRAINT "device_desk_sign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sys_site" (
    "id" SERIAL NOT NULL,
    "siteCode" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "siteType" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remark" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sys_site_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_base_station_stationCode_key" ON "device_base_station"("stationCode");

-- CreateIndex
CREATE UNIQUE INDEX "device_desk_sign_signCode_key" ON "device_desk_sign"("signCode");

-- CreateIndex
CREATE UNIQUE INDEX "sys_site_siteCode_key" ON "sys_site"("siteCode");

-- AddForeignKey
ALTER TABLE "device_base_station" ADD CONSTRAINT "device_base_station_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sys_site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_desk_sign" ADD CONSTRAINT "device_desk_sign_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sys_site"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_desk_sign" ADD CONSTRAINT "device_desk_sign_baseStationId_fkey" FOREIGN KEY ("baseStationId") REFERENCES "device_base_station"("id") ON DELETE SET NULL ON UPDATE CASCADE;
