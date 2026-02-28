CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`oldValues` json,
	`newValues` json,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingReference` varchar(20) NOT NULL,
	`userId` int NOT NULL,
	`flightNumber` varchar(10) NOT NULL,
	`departureAirport` varchar(3) NOT NULL,
	`arrivalAirport` varchar(3) NOT NULL,
	`departureDate` timestamp NOT NULL,
	`returnDate` timestamp,
	`numberOfPassengers` int NOT NULL,
	`cabinClass` enum('economy','business','first') NOT NULL DEFAULT 'economy',
	`baseFare` decimal(10,2) NOT NULL,
	`taxes` decimal(10,2) DEFAULT '0',
	`addOnsTotal` decimal(10,2) DEFAULT '0',
	`totalPrice` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`selectedSeats` json,
	`passengerDetails` json,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(20) NOT NULL,
	`specialRequests` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`),
	CONSTRAINT `bookings_bookingReference_unique` UNIQUE(`bookingReference`)
);
--> statement-breakpoint
CREATE TABLE `destinations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(3) NOT NULL,
	`name` varchar(100) NOT NULL,
	`nameAr` varchar(100) NOT NULL,
	`description` text,
	`descriptionAr` text,
	`imageUrl` text,
	`basePrice` decimal(10,2) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destinations_id` PRIMARY KEY(`id`),
	CONSTRAINT `destinations_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`flightNumber` varchar(10) NOT NULL,
	`departureAirport` varchar(3) NOT NULL,
	`arrivalAirport` varchar(3) NOT NULL,
	`departureTime` timestamp NOT NULL,
	`arrivalTime` timestamp NOT NULL,
	`aircraft` varchar(100) NOT NULL,
	`totalSeats` int NOT NULL,
	`availableSeats` int NOT NULL,
	`economyPrice` decimal(10,2) NOT NULL,
	`businessPrice` decimal(10,2),
	`firstPrice` decimal(10,2),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flights_id` PRIMARY KEY(`id`),
	CONSTRAINT `flights_flightNumber_unique` UNIQUE(`flightNumber`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`titleAr` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`descriptionAr` text NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`maxDiscount` decimal(10,2),
	`minBookingAmount` decimal(10,2) DEFAULT '0',
	`validFrom` timestamp NOT NULL,
	`validUntil` timestamp NOT NULL,
	`maxUsage` int,
	`currentUsage` int DEFAULT 0,
	`applicableRoutes` json,
	`applicableCabinClasses` json,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`),
	CONSTRAINT `offers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `websiteSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`updatedBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `websiteSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `websiteSettings_key_unique` UNIQUE(`key`)
);
