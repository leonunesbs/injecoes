-- AlterTable
ALTER TABLE "Injection" ADD COLUMN     "done" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notDone" BOOLEAN NOT NULL DEFAULT false;
