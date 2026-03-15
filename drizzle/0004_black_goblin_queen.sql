CREATE TABLE `programSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(100) NOT NULL,
	`settingValue` text NOT NULL,
	`description` text,
	`category` varchar(50) NOT NULL,
	`dataType` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `programSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `programSettings_settingKey_unique` UNIQUE(`settingKey`)
);
