DROP DATABASE IF EXISTS db_petpals;
CREATE DATABASE  IF NOT EXISTS `COMP2800`;
USE `COMP2800`;

DROP TABLE IF EXISTS `BBY35_pets`;
DROP TABLE IF EXISTS `BBY35_accounts`;

CREATE TABLE `BBY35_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20),
  `firstname` varchar(45) DEFAULT NULL,
  `lastname` varchar(45) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(20),
  `is_admin` tinyint NOT NULL DEFAULT '0',
  `is_caretaker` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


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

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
1, 'kzhou', 'Kelvin', 'Zhou', 'szhou54@my.bcit.ca', '12345', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
2, 'purple_towel', 'Angad', 'Grewal', 'agrewal130@my.bcit.ca', '12345', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
3, 'Lukario', 'dakaro', 'mueller', 'dmueller15@my.bcit.ca', '12345', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname, 
email, password, is_admin, is_caretaker) VALUES (
4, 'jashanjot', '-', 'jashanjot singh', 'jashanjotsingh@my.bcit.ca', '12345', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
5, 'admin1', 'Ad.', 'Min.', 'admin@email.com', '12345', 1, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
6, 'admin2', 'Ad.', 'Min.', 'admin@email.com', '12345', 1, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
7, 'admin3', 'Ad.', 'Min.', 'admin@email.com', '12345', 1, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
8, 'caretaker1', 'Care', 'Taker', 'caretaker@email.com', '12345', 0, 1);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
9, 'caretaker2', 'Care', 'Taker', 'caretaker@email.com', '12345', 0, 1);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
10, 'caretaker3', 'Care', 'Taker', 'caretaker@email.com', '12345', 0, 1);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
11, 'user1', 'End', 'User', 'user@email.com', '12345', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
12, 'user2', 'End', 'User', 'user@email.com', '12345', 0, 0);

INSERT INTO BBY35_accounts (id, username, firstname, lastname,
email, password, is_admin, is_caretaker) VALUES (
13, 'user3', 'End', 'User', 'user@email.com', '12345', 0, 0);

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (1,1,4,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (2,1,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (3,2,3,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (4,2,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (5,3,2,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (6,3,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (7,4,1,'cedric-vt-IuJc2qh2TcA-unsplash.jpeg','Whisker','Cat','F','Meow meow meow');

INSERT INTO BBY35_pets (`id`,`owner_id`,`caretaker_id`,`photo_url`,`name`,`species`,`gender`,`description`) VALUES (8,4,NULL,'dog_1.jpg','King','Dog','M','Bark bark bark');