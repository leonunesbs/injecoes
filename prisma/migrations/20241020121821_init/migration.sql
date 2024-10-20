-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "remainingOD" INTEGER NOT NULL DEFAULT 0,
    "remainingOS" INTEGER NOT NULL DEFAULT 0,
    "startOD" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Injection" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "OD" INTEGER NOT NULL DEFAULT 0,
    "OS" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Injection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Injection" ADD CONSTRAINT "Injection_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
