-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_parentCompanyId_fkey";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "whitelabel_logo" TEXT;
