-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: makemates
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `datetime` datetime DEFAULT NULL,
  `post_id` int NOT NULL,
  `user_id` int NOT NULL,
  `desc` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_comments_posts1_idx` (`post_id`),
  KEY `fk_comments_users1_idx` (`user_id`),
  CONSTRAINT `fk_comments_posts1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comments_users1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (NULL,1,11),(NULL,2,1),(NULL,2,11),(NULL,2,13),(NULL,3,11),(NULL,4,11);
LOCK TABLES `post_media` WRITE;
/*!40000 ALTER TABLE `post_media` DISABLE KEYS */;
INSERT INTO `post_media` VALUES (1,1,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/marvels-spider-man-miles-morales-cyberpunk-photo-mode-5120x2880-3650.jpg1727879260126.jpeg?alt=media&token=369ac8c4-163a-4294-a6e7-07140712e9cb',11),(2,2,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/Screenshot%20from%202024-08-17%2019-24-45.png1729191328475.png?alt=media&token=905334f1-8374-4056-a6a6-9d72cc9f236d',11),(3,3,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/IMG-20230119-WA0002.jpg1729352663174.jpeg?alt=media&token=9c6458b7-e9a0-4d23-a958-aa95be0565f8',12),(4,4,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/Attitudeness.jpg1729363352036.jpeg?alt=media&token=94d4a133-ffb9-4c10-8017-4d7ac47fc50e',13);
/*!40000 ALTER TABLE `post_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `posts`
--

DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `desc` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `fk_user_id_idx` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `posts`
--

LOCK TABLES `profileimages` WRITE;
/*!40000 ALTER TABLE `profileimages` DISABLE KEYS */;
INSERT INTO `profileimages` VALUES (1,1,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/11729333479096.jpeg?alt=media&token=09c9be3b-698c-4806-b8c8-407b9b11436f','2024-10-19 10:24:43',_binary ''),(2,1,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/11729333591558.jpeg?alt=media&token=db95d331-095a-4120-8dc7-a145734b045b','2024-10-19 10:26:35',_binary ''),(3,1,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/11729333662749.jpeg?alt=media&token=634d9cd3-7de4-49ee-8670-041e380a67c4','2024-10-19 10:27:51',_binary ''),(4,11,'https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/111729333918426.jpeg?alt=media&token=7d5f65a0-9640-47f1-990c-fa76150cf995','2024-10-19 10:32:02',_binary '');
/*!40000 ALTER TABLE `profileimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `relationships`
--

DROP TABLE IF EXISTS `relationships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `relationships` (
  `follow_id` int NOT NULL,
  `follower_id` int NOT NULL,
  `date` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`follow_id`,`follower_id`),
  KEY `fk_follower_id_idx` (`follower_id`),
  CONSTRAINT `fk_follow_id` FOREIGN KEY (`follow_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_follower_id` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `relationships`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John Doe','john@gmail.com','$2b$10$Fws3REXIit7Y3g.aJP3U4u7XTP4qqCsA4S3JXu5esdjdeg/dVtxGO','male','2000-05-11','https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/11729333662749.jpeg?alt=media&token=634d9cd3-7de4-49ee-8670-041e380a67c4',NULL,NULL,NULL,NULL),(10,'John Doe','johndoe@gmail.com','$2b$10$38rAGhWpiIyYq8fU6h2zh.3aqgBzUaft3Mz0yw97sAGUaSTYxroWe','male','1958-06-11',NULL,NULL,NULL,NULL,NULL),(11,'Arush Kumar','arush3339@gmail.com','$2b$10$kDrMbkvwodtNaURQ7nhUkuejWff2uplkwNO0bc0A.fWRBvkOYjLkm','male','2000-05-11','https://firebasestorage.googleapis.com/v0/b/makemates-61caf.appspot.com/o/111729333918426.jpeg?alt=media&token=7d5f65a0-9640-47f1-990c-fa76150cf995',NULL,NULL,NULL,NULL),(12,'Harsh Shukla','harsh@gmail.com','$2b$10$xLiHrpz8M8blguiS0p5/JehTIjaIvczOnnBzn4hhKNDLgjK008Gz.','male','1961-05-11',NULL,NULL,NULL,NULL,NULL),(13,'Abhay Sharma','abhay@gmail.co','$2b$10$HB/r977p431NNXHB5E6aQOKRk19LBapRd3I/3aSG6yix4Fh3TJWEi','male','2000-02-11',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'makemates'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-11-26 12:02:39
