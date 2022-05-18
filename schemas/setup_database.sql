-- Removes existing or out of date databases
-- As well as creates the COMP2800 database
DROP DATABASE IF EXISTS db_petpals;
CREATE DATABASE  IF NOT EXISTS `COMP2800`;

-- Selects the COMP2800 database to perform creation
USE `COMP2800`;

SET FOREIGN_KEY_CHECKS=0; -- to disable them

DROP TABLE IF EXISTS `BBY35_caretaker_info`;
DROP TABLE IF EXISTS `BBY35_pets`;
DROP TABLE IF EXISTS `BBY35_images`;
DROP TABLE IF EXISTS `BBY35_pet_timeline`;
DROP TABLE IF EXISTS `BBY35_accounts`;

SET FOREIGN_KEY_CHECKS=1; -- to re-enable them

--
-- Table structure for table BBY35_pets
--

CREATE TABLE `BBY35_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20),
  `firstname` varchar(45) DEFAULT NULL,
  `lastname` varchar(45) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100),
  `is_admin` tinyint NOT NULL DEFAULT '0',
  `is_caretaker` tinyint NOT NULL DEFAULT '0',
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `address` varchar (255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Table structure for table BBY35_pets
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

--
-- Table structure for table BBY35_images
--

CREATE TABLE `BBY35_pet_timeline` (
  `timeline_id` int NOT NULL AUTO_INCREMENT,
  `pet_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `location` varchar(20) DEFAULT NULL,
  PRIMARY KEY (timeline_id),
  KEY `pet_id_idx` (`pet_id`),
  CONSTRAINT `pet_id` FOREIGN KEY (`pet_id`) REFERENCES `BBY35_pets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


--
-- Add data to BBY35_accounts table (All passwords '12345')
--
INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
1, 'kzhou', 'Kelvin', 'Zhou', 'szhou54@my.bcit.ca', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
2, 'purple_towel', 'Angad', 'Grewal', 'agrewal130@my.bcit.ca', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
3, 'Lukario', 'dakaro', 'mueller', 'dmueller15@my.bcit.ca', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
4, 'jashanjot', '-', 'jashanjot singh', 'jashanjotsingh@my.bcit.ca', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
5, 'admin1', 'Ad.', 'Min.', 'admin@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 1, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
6, 'admin2', 'Ad.', 'Min.', 'admin@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 1, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
7, 'admin3', 'Ad.', 'Min.', 'admin@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 1, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
8, 'caretaker1', 'Care', 'Taker', 'caretaker@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 1);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
9, 'caretaker2', 'Care', 'Taker', 'caretaker@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 1);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
10, 'caretaker3', 'Care', 'Taker', 'caretaker@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 1);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
11, 'user1', 'End', 'User', 'user@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
12, 'user2', 'End', 'User', 'user@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
13, 'user3', 'End', 'User', 'user@email.com', '$2b$10$vAtaahOy4/IHyER30cSC.uqpHHawpIf1kbMNQJTAM73ABVjUr3iMS', 0, 0);

-- Add data to BBY35_pets table
INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (1,1,4,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (2,1,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (3,2,3,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (4,2,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (5,3,2,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (6,3,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (7,4,1,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (8,4,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');


-- Add data to BBY35_caretaker_info table
INSERT INTO `BBY35_caretaker_info`
  (`account_id`,
  `animal_affection`,
  `experience`,
  `allergies`,
  `other_pets`,
  `busy_hours`,
  `house_type`,
  `house_active_level`,
  `people_in_home`,
  `children_in_home`,
  `yard_type`)
  VALUES (8, 9,
          'None, I like dogs.',
          '',
          '',
          '',
          'house', 0, 2, 0, 'not enclosed');

INSERT INTO `BBY35_caretaker_info`
  (`account_id`,
  `animal_affection`,
  `experience`,
  `allergies`,
  `other_pets`,
  `busy_hours`,
  `house_type`,
  `house_active_level`,
  `people_in_home`,
  `children_in_home`,
  `yard_type`)
  VALUES (9, 10,
          'I like cats',
          'I''m allergic to dogs.',
          '2 Cats, Siamese and Tabby.',
          'I''m retired.',
          'apartment', 1, 3, 1, 'no yard');

INSERT INTO `BBY35_caretaker_info`
  (`account_id`,
  `animal_affection`,
  `experience`,
  `allergies`,
  `other_pets`,
  `busy_hours`,
  `house_type`,
  `house_active_level`,
  `people_in_home`,
  `children_in_home`,
  `yard_type`)
  VALUES (10, 5, 
          '', NULL,
          NULL, NULL, 
          'other', 2, 5, 0, 'partially enclosed');
