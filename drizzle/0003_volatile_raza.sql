CREATE TABLE IF NOT EXISTS "stripe_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
