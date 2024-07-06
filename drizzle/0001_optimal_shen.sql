CREATE TABLE IF NOT EXISTS "refreshTokens" (
	"id" integer PRIMARY KEY NOT NULL,
	"userId" integer,
	"token" text,
	"createdAt" timestamp,
	"expiresIn" date,
	"device" varchar(200)
);
