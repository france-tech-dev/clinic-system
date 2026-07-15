-- Drop role from users: authorization is org-scoped on member.role
ALTER TABLE "users" DROP COLUMN "role";
