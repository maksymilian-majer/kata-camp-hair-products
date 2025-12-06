CREATE TYPE "public"."active_symptom" AS ENUM('itching', 'redness', 'yellow_scales', 'white_flakes', 'pain_burning');--> statement-breakpoint
CREATE TYPE "public"."hair_strand_condition" AS ENUM('natural', 'dyed', 'bleached');--> statement-breakpoint
CREATE TYPE "public"."ingredient_tolerance" AS ENUM('resilient', 'moderate', 'hypoallergenic');--> statement-breakpoint
CREATE TYPE "public"."scalp_condition" AS ENUM('seborrheic_dermatitis', 'psoriasis', 'atopic_dermatitis', 'severe_dandruff', 'sensitive_itchy');--> statement-breakpoint
CREATE TYPE "public"."sebum_level" AS ENUM('excessive', 'moderate', 'dry');--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scalp_condition" "scalp_condition" NOT NULL,
	"sebum_level" "sebum_level" NOT NULL,
	"active_symptoms" "active_symptom"[] NOT NULL,
	"hair_strand_condition" "hair_strand_condition" NOT NULL,
	"ingredient_tolerance" "ingredient_tolerance" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "questionnaires_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;