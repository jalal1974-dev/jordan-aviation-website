CREATE TABLE `profileHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fieldName` varchar(100) NOT NULL,
	`oldValue` text,
	`newValue` text,
	`changeType` enum('created','updated','deleted','verified') NOT NULL,
	`changedBy` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`reason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profileHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` enum('passport','national_id','driver_license','visa','other') NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`documentNumber` varchar(100),
	`fileUrl` varchar(500) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(50) NOT NULL,
	`issueDate` timestamp,
	`expiryDate` timestamp,
	`isExpired` boolean NOT NULL DEFAULT false,
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verificationDate` timestamp,
	`verifiedBy` int,
	`rejectionReason` text,
	`description` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailNotifications` boolean NOT NULL DEFAULT true,
	`smsNotifications` boolean NOT NULL DEFAULT false,
	`pushNotifications` boolean NOT NULL DEFAULT true,
	`bookingConfirmations` boolean NOT NULL DEFAULT true,
	`flightReminders` boolean NOT NULL DEFAULT true,
	`promotionalOffers` boolean NOT NULL DEFAULT true,
	`loyaltyUpdates` boolean NOT NULL DEFAULT true,
	`newsAndUpdates` boolean NOT NULL DEFAULT false,
	`preferredSeat` varchar(50),
	`mealPreference` varchar(50),
	`wheelchairAssistance` boolean NOT NULL DEFAULT false,
	`specialAssistance` text,
	`preferredContactMethod` varchar(50) NOT NULL DEFAULT 'email',
	`communicationLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`shareDataWithPartners` boolean NOT NULL DEFAULT false,
	`allowThirdPartyMarketing` boolean NOT NULL DEFAULT false,
	`darkMode` boolean NOT NULL DEFAULT false,
	`largeText` boolean NOT NULL DEFAULT false,
	`highContrast` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100),
	`lastName` varchar(100),
	`dateOfBirth` timestamp,
	`gender` enum('male','female','other','prefer_not_to_say'),
	`nationality` varchar(100),
	`phoneNumber` varchar(20),
	`alternatePhone` varchar(20),
	`street` varchar(255),
	`city` varchar(100),
	`state` varchar(100),
	`postalCode` varchar(20),
	`country` varchar(100),
	`passportNumber` varchar(50),
	`passportIssueDate` timestamp,
	`passportExpiryDate` timestamp,
	`passportCountry` varchar(100),
	`frequentFlyerNumber` varchar(50),
	`frequentFlyerStatus` varchar(50),
	`emergencyContactName` varchar(100),
	`emergencyContactPhone` varchar(20),
	`emergencyContactRelation` varchar(50),
	`profileCompletionPercentage` int NOT NULL DEFAULT 0,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verificationDate` timestamp,
	`profilePhotoUrl` varchar(500),
	`bio` text,
	`preferredLanguage` varchar(10) NOT NULL DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `userProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `profileHistory` ADD CONSTRAINT `profileHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userDocuments` ADD CONSTRAINT `userDocuments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userProfiles` ADD CONSTRAINT `userProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `profileHistory_userId_idx` ON `profileHistory` (`userId`);--> statement-breakpoint
CREATE INDEX `profileHistory_changedBy_idx` ON `profileHistory` (`changedBy`);--> statement-breakpoint
CREATE INDEX `profileHistory_createdAt_idx` ON `profileHistory` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userDocuments_userId_idx` ON `userDocuments` (`userId`);--> statement-breakpoint
CREATE INDEX `userDocuments_documentType_idx` ON `userDocuments` (`documentType`);--> statement-breakpoint
CREATE INDEX `userDocuments_verificationStatus_idx` ON `userDocuments` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `userDocuments_expiryDate_idx` ON `userDocuments` (`expiryDate`);--> statement-breakpoint
CREATE INDEX `userPreferences_userId_idx` ON `userPreferences` (`userId`);--> statement-breakpoint
CREATE INDEX `userProfiles_userId_idx` ON `userProfiles` (`userId`);--> statement-breakpoint
CREATE INDEX `userProfiles_passportNumber_idx` ON `userProfiles` (`passportNumber`);--> statement-breakpoint
CREATE INDEX `userProfiles_frequentFlyerNumber_idx` ON `userProfiles` (`frequentFlyerNumber`);