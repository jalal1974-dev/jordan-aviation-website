CREATE TABLE `userNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`messageAr` text NOT NULL,
	`type` enum('booking_confirmation','flight_reminder','flight_update','booking_update','promotional_offer','loyalty_update','document_verification','payment_confirmation','system_alert','general_message') NOT NULL,
	`category` enum('booking','flight','loyalty','payment','account','promotion','system') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`actionUrl` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`isArchived` boolean NOT NULL DEFAULT false,
	`archivedAt` timestamp,
	`isPinned` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`emailSent` boolean NOT NULL DEFAULT false,
	`smsSent` boolean NOT NULL DEFAULT false,
	`pushSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `userNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `userNotifications` ADD CONSTRAINT `userNotifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `userNotifications_userId_idx` ON `userNotifications` (`userId`);--> statement-breakpoint
CREATE INDEX `userNotifications_type_idx` ON `userNotifications` (`type`);--> statement-breakpoint
CREATE INDEX `userNotifications_category_idx` ON `userNotifications` (`category`);--> statement-breakpoint
CREATE INDEX `userNotifications_isRead_idx` ON `userNotifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `userNotifications_createdAt_idx` ON `userNotifications` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userNotifications_userId_createdAt_idx` ON `userNotifications` (`userId`,`createdAt`);