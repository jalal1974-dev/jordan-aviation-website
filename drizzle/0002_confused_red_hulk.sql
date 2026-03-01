CREATE TABLE `affiliatePayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50) NOT NULL,
	`transactionId` varchar(100),
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `affiliatePayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliateReferrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referralCode` varchar(50) NOT NULL,
	`referredUserId` int,
	`referredEmail` varchar(320),
	`status` enum('clicked','signed_up','booked','completed') NOT NULL DEFAULT 'clicked',
	`bookingId` int,
	`commissionAmount` decimal(12,2),
	`commissionStatus` enum('pending','approved','paid') NOT NULL DEFAULT 'pending',
	`clickedAt` timestamp,
	`convertedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliateReferrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliateReferrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`affiliateCode` varchar(50) NOT NULL,
	`companyName` varchar(255),
	`website` varchar(255),
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(20),
	`commissionRate` decimal(5,2) NOT NULL DEFAULT '5.00',
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`totalEarnings` decimal(12,2) NOT NULL DEFAULT '0',
	`totalReferrals` int NOT NULL DEFAULT 0,
	`totalConversions` int NOT NULL DEFAULT 0,
	`paymentMethod` varchar(50),
	`paymentDetails` json,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyPointHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`pointsChange` int NOT NULL,
	`reason` varchar(100) NOT NULL,
	`bookingId` int,
	`referenceId` varchar(100),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyPointHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`nameAr` varchar(50) NOT NULL,
	`minPoints` int NOT NULL,
	`maxPoints` int,
	`pointsMultiplier` decimal(3,2) NOT NULL DEFAULT '1.00',
	`benefitsDescription` text,
	`benefitsDescriptionAr` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyTiers_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyTiers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `userLoyaltyPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`availablePoints` int NOT NULL DEFAULT 0,
	`redeemedPoints` int NOT NULL DEFAULT 0,
	`currentTierId` int NOT NULL,
	`pointsExpireAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userLoyaltyPoints_id` PRIMARY KEY(`id`)
);
