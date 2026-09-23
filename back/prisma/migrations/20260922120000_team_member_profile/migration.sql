-- TeamMember profile fields for the team page detail modal
ALTER TABLE "team_members" ADD COLUMN "bio" TEXT,
ADD COLUMN "story" TEXT,
ADD COLUMN "stat" TEXT,
ADD COLUMN "stat_label" TEXT,
ADD COLUMN "base" TEXT,
ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[];
