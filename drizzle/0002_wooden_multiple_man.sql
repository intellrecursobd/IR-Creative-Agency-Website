CREATE TABLE `agency_enquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_key` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`brand` text DEFAULT '' NOT NULL,
	`services` text NOT NULL,
	`budget` text DEFAULT '' NOT NULL,
	`deadline` text DEFAULT '' NOT NULL,
	`brief` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `agency_enquiries_request_key_unique` ON `agency_enquiries` (`request_key`);