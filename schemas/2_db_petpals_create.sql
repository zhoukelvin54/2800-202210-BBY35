CREATE DATABASE IF NOT EXISTS `COMP2800`;
USE `COMP2800`;

--
-- Drop tables in order to avoid foreign key restraint
--

DROP TABLE IF EXISTS `BBY35_caretaker_info`;
DROP TABLE IF EXISTS `BBY35_pets`;
DROP TABLE IF EXISTS `BBY35_accounts`;

--
-- Table structure for table `BBY35_accounts`
--



CREATE TABLE `BBY35_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) NOT NULL,
  `firstname` varchar(45) DEFAULT NULL,
  `lastname` varchar(45) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(20) NOT NULL,
  `is_admin` tinyint NOT NULL DEFAULT '0',
  `is_caretaker` tinyint NOT NULL DEFAULT '0',
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `address` varchar (255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Table structure for table `BBY35_pets`
--


CREATE TABLE `BBY35_pets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `owner_id` int NOT NULL,
  `caretaker_id` int DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `name` varchar(45) NOT NULL,
  `species` varchar(45) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id_idx` (`owner_id`),
  KEY `caretaker_id_idx` (`caretaker_id`),
  CONSTRAINT `caretaker_id` FOREIGN KEY (`caretaker_id`) REFERENCES `BBY35_accounts` (`id`),
  CONSTRAINT `owner_id` FOREIGN KEY (`owner_id`) REFERENCES `BBY35_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Table structure for table BBY35_caretaker_info
--



CREATE TABLE `BBY35_caretaker_info` (
  `account_id` int NOT NULL,
  `animal_affection` int NOT NULL,
  `experience` varchar(255) NOT NULL,
  `allergies` varchar(255) DEFAULT NULL,
  `other_pets` varchar(255) DEFAULT NULL,
  `busy_hours` varchar(255) DEFAULT NULL,
  `house_type` varchar(32) NOT NULL,
  `house_active_level` int NOT NULL,
  `people_in_home` int NOT NULL,
  `children_in_home` boolean NOT NULL,
  `yard_type` varchar(32) NOT NULL,
  PRIMARY KEY (`account_id`),
  key `account_id_idx` (`account_id`),
  CONSTRAINT `account_id` FOREIGN KEY (`account_id`) REFERENCES `BBY35_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;