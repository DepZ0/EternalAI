DROP TABLE "refreshTokens";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripeCustomerId_unique" UNIQUE("stripeCustomerId");