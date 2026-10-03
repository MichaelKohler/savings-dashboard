-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "uncheckedInChartsByDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "uncheckedInChartsByDefault" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Type" ADD COLUMN     "uncheckedInChartsByDefault" BOOLEAN NOT NULL DEFAULT false;
