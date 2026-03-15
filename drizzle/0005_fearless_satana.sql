CREATE TABLE `bookingMilesPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`userId` int NOT NULL,
	`milesEarned` int NOT NULL DEFAULT 0,
	`pointsEarned` int NOT NULL DEFAULT 0,
	`distance` int NOT NULL,
	`cabinClass` varchar(20) NOT NULL,
	`milesMultiplier` decimal(5,2) NOT NULL DEFAULT '1.0',
	`pointsMultiplier` decimal(5,2) NOT NULL DEFAULT '1.0',
	`baseFare` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookingMilesPoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `flightRoutes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departureAirport` varchar(3) NOT NULL,
	`arrivalAirport` varchar(3) NOT NULL,
	`distance` int NOT NULL,
	`flightDuration` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `flightRoutes_id` PRIMARY KEY(`id`)
);
