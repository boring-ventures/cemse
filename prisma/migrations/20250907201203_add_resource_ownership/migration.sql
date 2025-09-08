-- AlterTable
ALTER TABLE "resources" ALTER COLUMN "created_by_user_id" DROP NOT NULL;

-- Update existing resources to assign them to super admin
UPDATE "resources" 
SET "created_by_user_id" = (
  SELECT "id" FROM "users" WHERE "role" = 'SUPERADMIN' LIMIT 1
)
WHERE "created_by_user_id" IS NULL;

-- Now make the field required
ALTER TABLE "resources" ALTER COLUMN "created_by_user_id" SET NOT NULL;