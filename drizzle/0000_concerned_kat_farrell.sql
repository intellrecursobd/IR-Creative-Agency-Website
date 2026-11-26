CREATE TABLE `registrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`original_name` text NOT NULL,
	`clan_name` text NOT NULL,
	`clan_key` text NOT NULL,
	`phone` text NOT NULL,
	`phone_key` text NOT NULL,
	`email` text NOT NULL,
	`email_key` text NOT NULL,
	`social_profile` text NOT NULL,
	`access_code` text NOT NULL,
	`partner_name` text,
	`tent_addon` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_clan_key_unique` ON `registrations` (`clan_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_email_key_unique` ON `registrations` (`email_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_phone_key_unique` ON `registrations` (`phone_key`);