CREATE TABLE "subject" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timetable" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"teacher_id" text NOT NULL,
	"subject_id" text NOT NULL,
	"day" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_active" boolean NOT NULL,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_student_id_user_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable" ADD CONSTRAINT "timetable_subject_id_subject_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subject"("id") ON DELETE cascade ON UPDATE no action;