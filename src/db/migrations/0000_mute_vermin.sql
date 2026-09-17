CREATE TYPE "public"."book_status" AS ENUM('coming_soon', 'sample_available', 'launched');--> statement-breakpoint
CREATE TABLE "book_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"page_number" integer NOT NULL,
	"image_path" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"synopsis" text DEFAULT '' NOT NULL,
	"cover_path" text,
	"status" "book_status" DEFAULT 'coming_soon' NOT NULL,
	"page_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"book_id" uuid NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"rating" smallint,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_book_id_email_unique" UNIQUE("book_id","email")
);
--> statement-breakpoint
ALTER TABLE "book_pages" ADD CONSTRAINT "book_pages_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE cascade ON UPDATE no action;