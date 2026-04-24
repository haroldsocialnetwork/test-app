-- CreateTable
CREATE TABLE "Message" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL DEFAULT 'Server',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CandidateAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "candidateName" TEXT NOT NULL DEFAULT 'Unknown',
    "jobTitle" TEXT NOT NULL DEFAULT 'Unknown Position',
    "jobDescription" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL,
    "strengths" TEXT NOT NULL,
    "relevanceSummary" TEXT NOT NULL,
    "missingSkills" TEXT NOT NULL,
    "unclearExperience" TEXT NOT NULL,
    "qualificationGaps" TEXT NOT NULL,
    "followUpMessage" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Application" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jobId" INTEGER NOT NULL,
    "resumeText" TEXT,
    "resumePdf" BLOB,
    "applicantEmail" TEXT,
    "analyzed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
