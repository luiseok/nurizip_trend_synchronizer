-- CreateTable
CREATE TABLE "announcement" (
    "announcement_id" SERIAL NOT NULL,
    "region_id" INTEGER,
    "category" VARCHAR,
    "details" VARCHAR,
    "hash" VARCHAR(32),
    "period" VARCHAR,
    "total" INTEGER NOT NULL,
    "priority" INTEGER,
    "general" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("announcement_id")
);

-- CreateTable
CREATE TABLE "applicant" (
    "applicant_id" SERIAL NOT NULL,
    "region_id" INTEGER,
    "announcement_id" INTEGER,
    "total" INTEGER,
    "priority" INTEGER,
    "general" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applicant_pkey" PRIMARY KEY ("applicant_id")
);

-- CreateTable
CREATE TABLE "job_log" (
    "log_id" SERIAL NOT NULL,
    "did_succeed" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "region" (
    "region_id" SERIAL NOT NULL,
    "province" VARCHAR(10) NOT NULL,
    "city" VARCHAR(20) NOT NULL,

    CONSTRAINT "region_pkey" PRIMARY KEY ("region_id")
);

-- CreateTable
CREATE TABLE "remaining" (
    "remaining_id" SERIAL NOT NULL,
    "region_id" INTEGER,
    "announcement_id" INTEGER,
    "total" INTEGER,
    "priority" INTEGER,
    "general" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remaining_pkey" PRIMARY KEY ("remaining_id")
);

-- CreateTable
CREATE TABLE "shipment" (
    "shipment_id" SERIAL NOT NULL,
    "region_id" INTEGER,
    "announcement_id" INTEGER,
    "total" INTEGER,
    "priority" INTEGER,
    "general" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipment_pkey" PRIMARY KEY ("shipment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "region_province_city_idx" ON "region"("province", "city");

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "applicant" ADD CONSTRAINT "applicant_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remaining" ADD CONSTRAINT "remaining_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "remaining" ADD CONSTRAINT "remaining_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "shipment" ADD CONSTRAINT "shipment_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("region_id") ON DELETE CASCADE ON UPDATE NO ACTION;
