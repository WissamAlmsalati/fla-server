-- CreateTable: SiteSettings
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("key")
);

-- CreateTable: SettingsChangeLog
CREATE TABLE IF NOT EXISTS "SettingsChangeLog" (
    "id" SERIAL NOT NULL,
    "settingKey" TEXT NOT NULL,
    "changedById" INTEGER NOT NULL,
    "changedByName" TEXT NOT NULL,
    "note" TEXT,
    "diffSummary" TEXT,
    "snapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SettingsChangeLog_pkey" PRIMARY KEY ("id")
);
