ALTER TABLE "users"
ADD COLUMN "registration_intent" TEXT;

UPDATE "users"
SET "emailVerified" = "createdAt"
WHERE "emailVerified" IS NULL;

UPDATE "users" AS member
SET "password" = NULL
FROM "admin_users" AS admin
WHERE LOWER(member."email") = LOWER(admin."email")
  AND member."password" IS NOT NULL
  AND member."password" = admin."password";

ALTER TABLE "newsletter_subscribers"
ADD COLUMN "confirmed_at" TIMESTAMP(3);

UPDATE "newsletter_subscribers"
SET "confirmed_at" = "subscribedAt"
WHERE "confirmed_at" IS NULL;

CREATE TABLE "email_action_tokens" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_action_tokens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "email_action_tokens_token_hash_key"
ON "email_action_tokens"("token_hash");

CREATE UNIQUE INDEX "email_action_tokens_purpose_subject_id_key"
ON "email_action_tokens"("purpose", "subject_id");

CREATE INDEX "email_action_tokens_expires_at_idx"
ON "email_action_tokens"("expires_at");

CREATE INDEX "rate_limit_buckets_expires_at_idx"
ON "rate_limit_buckets"("expires_at");
