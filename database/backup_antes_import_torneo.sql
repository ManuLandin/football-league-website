-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: liga_estrellas
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_equipos`
--

DROP TABLE IF EXISTS `admin_equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_equipos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` bigint(20) unsigned NOT NULL,
  `equipo_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_admin_equipo` (`admin_id`,`equipo_id`),
  UNIQUE KEY `uniq_equipo_admin` (`equipo_id`),
  CONSTRAINT `fk_admin_equipo_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_admin_equipo_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_equipos`
--

LOCK TABLES `admin_equipos` WRITE;
/*!40000 ALTER TABLE `admin_equipos` DISABLE KEYS */;
INSERT INTO `admin_equipos` VALUES (1,4,1,'2026-03-15 02:36:11','2026-03-15 02:36:11'),(2,5,3,'2026-05-01 01:39:39','2026-05-01 01:39:39');
/*!40000 ALTER TABLE `admin_equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('super','equipo') NOT NULL DEFAULT 'equipo',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Admin','super@liga.test','$2y$10$hQx7uQYkDI/23bmJ9LT0yO08cPZ3uNVDtVLdP0Y3EWeUjcuWPMQkq','super',1,'2026-03-03 03:19:41','2026-03-03 03:19:41'),(2,'Admin1','admin@liga.com','$2y$10$tExReYbYmgIKcPf4xrJmk.vexQGcK/oI6cMVM77YAiMfTUWFEAPKC','super',1,'2026-03-04 02:18:54','2026-03-04 02:18:54'),(3,'JUAN','admin@gmail.com','$2y$10$lfqFT1ptd4CylaeInf3dguab3yyeDfHVbl.ZyfNyPTVqJizs8M2G2','super',1,'2026-03-09 23:29:32','2026-03-09 23:29:32'),(4,'Juan','juanmanuelpecos@hotmail.com','$2y$10$hFMfBIVBKxxCJ4kWgbQUfezJXQIHQpN19.x8HJ2uKgncuHV/dh8mG','equipo',1,'2026-03-15 02:36:11','2026-03-15 02:36:11'),(5,'Juan','fernandolandinromo@gmail.com','$2y$10$F68YYCNfAwYmeFU9runC1OhkJ/C1TKrh1PrHBs9HQVfaGfRvINd6K','equipo',1,'2026-05-01 01:39:39','2026-05-01 01:39:39');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `arbitros`
--

DROP TABLE IF EXISTS `arbitros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `arbitros` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `apellidos` varchar(160) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `arbitros`
--

LOCK TABLES `arbitros` WRITE;
/*!40000 ALTER TABLE `arbitros` DISABLE KEYS */;
INSERT INTO `arbitros` VALUES (1,'Roberto','Saldaña Méndez','2026-03-10 00:01:22','2026-03-10 00:01:22'),(2,'Patricia','Villanueva Cruz','2026-03-10 00:01:22','2026-03-10 00:01:22'),(3,'Juan Jesus','Lira','2026-03-22 18:49:40','2026-03-22 18:49:40'),(4,'Miguel','Hernandez','2026-05-02 00:25:18','2026-05-02 00:25:18');
/*!40000 ALTER TABLE `arbitros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora_cambios`
--

DROP TABLE IF EXISTS `bitacora_cambios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bitacora_cambios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `admin_id` bigint(20) unsigned DEFAULT NULL,
  `admin_nombre` varchar(160) NOT NULL,
  `admin_rol` enum('super','equipo') NOT NULL,
  `accion` varchar(120) NOT NULL,
  `detalle` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bitacora_created_at` (`created_at`),
  KEY `idx_bitacora_admin_rol` (`admin_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora_cambios`
--

LOCK TABLES `bitacora_cambios` WRITE;
/*!40000 ALTER TABLE `bitacora_cambios` DISABLE KEYS */;
INSERT INTO `bitacora_cambios` VALUES (1,3,'JUAN','super','EQUIPO_CREAR','Creó equipo \"PACHUCA\" (id 4)','2026-03-22 20:01:30'),(2,3,'JUAN','super','EQUIPO_CREAR','Creó equipo \"AMERICA MH\" (id 5)','2026-03-23 02:12:47'),(3,3,'JUAN','super','PARTIDO_CREAR','Programó partido id 5 (jornada_id 2)','2026-03-23 02:18:43'),(4,4,'Juan','equipo','JUGADOR_ELIMINAR','Eliminó jugador id 5','2026-03-23 02:22:37'),(5,3,'JUAN','super','CATEGORIA_ASIGNAR','Asignó categoría \"Sub-15\" al equipo id 5','2026-03-23 02:45:19'),(6,3,'JUAN','super','JUGADOR_CREAR','Creó jugador \"Manuel Landin\" (id 19)','2026-03-23 02:46:41'),(7,3,'JUAN','super','EQUIPO_EDITAR','Actualizó equipo id 5 -> \"AMERICA MH\"','2026-03-23 02:47:34'),(8,3,'JUAN','super','JUGADOR_CREAR','Creó jugador \"Jose Luis\" (id 20)','2026-03-23 02:50:40'),(9,3,'JUAN','super','JUGADOR_CREAR','Creó jugador \"FERNANDO ROMO\" (id 21)','2026-03-23 02:54:33'),(10,4,'Juan','equipo','JUGADOR_EDITAR','Actualizó jugador id 1 -> \"Andrés López Martínez\"','2026-03-23 03:16:44'),(11,3,'JUAN','super','PARTIDO_CREAR','Programó partido id 6 (jornada_id 2)','2026-04-26 02:06:32'),(12,3,'JUAN','super','PARTIDO_ALINEACION','Guardó alineación de partido id 6 con 7 jugadores','2026-04-26 02:17:22'),(13,3,'JUAN','super','PARTIDO_EDITAR','Actualizó partido id 6','2026-04-26 02:17:34'),(14,3,'JUAN','super','CATEGORIA_ASIGNAR','Asignó categoría \"Sub-15\" al equipo id 4','2026-04-26 02:34:14'),(15,3,'JUAN','super','PARTIDO_CREAR','Programó partido id 7 (jornada_id 2)','2026-04-26 02:34:51'),(16,3,'JUAN','super','PARTIDO_ALINEACION','Guardó alineación de partido id 7 con 2 jugadores','2026-04-26 02:35:23'),(17,3,'JUAN','super','PARTIDO_EDITAR','Actualizó partido id 7','2026-04-26 02:35:30'),(18,3,'JUAN','super','ADMIN_CREAR','Creó administrador \"Juan\" (fernandolandinromo@gmail.com) con rol equipo y equipo_id 3','2026-05-01 01:39:39'),(19,5,'Juan','equipo','JUGADOR_CREAR','Creó jugador \"Manuel Landin\" (id 22)','2026-05-01 01:47:10'),(20,3,'JUAN','super','CATEGORIA_CREAR','Creó categoría global \"Sub-21\"','2026-05-02 00:15:52'),(21,3,'JUAN','super','CATEGORIA_ASIGNAR','Asignó categoría \"Sub-21\" al equipo id 5','2026-05-02 00:16:10'),(22,3,'JUAN','super','JORNADA_CREAR','Creó jornada \"Jornada 3\"','2026-05-02 00:20:56'),(23,3,'JUAN','super','PARTIDO_CREAR','Programó partido id 8 (jornada_id 3)','2026-05-02 00:22:45'),(24,3,'JUAN','super','PARTIDO_ALINEACION','Guardó alineación de partido id 8 con 6 jugadores','2026-05-02 00:23:56'),(25,3,'JUAN','super','PARTIDO_EDITAR','Actualizó partido id 8','2026-05-02 00:24:04'),(26,3,'JUAN','super','ARBITRO_CREAR','Creó árbitro \"Miguel Hernandez\"','2026-05-02 00:25:18');
/*!40000 ALTER TABLE `bitacora_cambios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Sub-10','2026-03-10 00:01:22','2026-03-10 00:01:22'),(2,'Sub-12','2026-03-10 00:01:22','2026-03-10 00:01:22'),(3,'Sub-15','2026-03-10 00:01:22','2026-03-10 00:01:22'),(4,'Sub-18','2026-03-15 02:35:06','2026-03-15 02:35:06'),(5,'Sub-21','2026-05-02 00:15:52','2026-05-02 00:15:52');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipo_categoria`
--

DROP TABLE IF EXISTS `equipo_categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipo_categoria` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `equipo_id` bigint(20) unsigned NOT NULL,
  `categoria_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_equipo_categoria` (`equipo_id`,`categoria_id`),
  KEY `idx_equipo_categoria_categoria` (`categoria_id`),
  CONSTRAINT `fk_equipo_categoria_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_equipo_categoria_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipo_categoria`
--

LOCK TABLES `equipo_categoria` WRITE;
/*!40000 ALTER TABLE `equipo_categoria` DISABLE KEYS */;
INSERT INTO `equipo_categoria` VALUES (1,1,1,'2026-03-10 00:01:22','2026-03-10 00:01:22'),(2,1,2,'2026-03-10 00:01:22','2026-03-10 00:01:22'),(3,1,3,'2026-03-10 00:01:22','2026-03-10 00:01:22'),(4,2,3,'2026-03-10 00:04:36','2026-03-10 00:04:36'),(6,3,3,'2026-03-22 18:51:15','2026-03-22 18:51:15'),(7,5,3,'2026-03-23 02:45:19','2026-03-23 02:45:19'),(8,4,3,'2026-04-26 02:34:14','2026-04-26 02:34:14'),(9,5,5,'2026-05-02 00:16:10','2026-05-02 00:16:10');
/*!40000 ALTER TABLE `equipo_categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `equipos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(160) NOT NULL,
  `escudo_url` varchar(255) DEFAULT NULL,
  `entrenador` varchar(160) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `email` varchar(160) DEFAULT NULL,
  `ciudad` varchar(120) DEFAULT NULL,
  `sede` varchar(180) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (1,'FC Barcelona','/v1_LDF/img/fc_barcelona/escudo.png','Hansi Flick',NULL,NULL,NULL,NULL,NULL,'2026-03-10 00:01:22','2026-03-15 02:10:37'),(2,'Real Madrid','/v1_LDF/img/real_madrid/escudo.png','Alvaro Arbeloa',NULL,NULL,NULL,NULL,NULL,'2026-03-10 00:02:42','2026-03-15 02:10:44'),(3,'PUMAS','/v1_LDF/img/pumas/escudo.jpg','EFRAIN JUAREZ','5544557788','efra@gmail.com','CDMX','CU','EQUIPO DE FUTBOL SATELITE','2026-03-22 18:51:00','2026-03-22 18:51:00'),(4,'PACHUCA','/v1_LDF/img/pachuca/escudo.png','Jose Luis','5566778899','jksjedi@gmail.com','CDMX','Plan sexenal','EQUIPO DE PACHUCA ARBOLEDAS','2026-03-22 20:01:30','2026-03-22 20:01:30'),(5,'AMERICA MH',NULL,'JARDINE',NULL,NULL,NULL,NULL,NULL,'2026-03-23 02:12:47','2026-03-23 02:47:34');
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `contenido` text NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `orden` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_eventos_orden` (`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
INSERT INTO `eventos` VALUES (1,'IR A CU','SIGUIENTE SEMANA IREMOS A CU','/v1_LDF/img/ir_a_cu/evento_1774208875_967.jpg',0,1,'2026-03-22 19:47:55','2026-03-22 19:47:55'),(2,'DWOJHIWED','IQDUGDQWUGDQUWGQYUWDGWQYUDGQIWHDGQIWHDGIWQHGIUWQYDGIUYWQDGQYIWDGIWQUGIQUWGIU',NULL,1,1,'2026-03-22 19:49:33','2026-03-22 19:49:33');
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jornadas`
--

DROP TABLE IF EXISTS `jornadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jornadas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=220 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jornadas`
--

LOCK TABLES `jornadas` WRITE;
/*!40000 ALTER TABLE `jornadas` DISABLE KEYS */;
INSERT INTO `jornadas` VALUES (1,'Jornada 1','2026-03-22 18:47:50','2026-03-22 18:47:50'),(2,'Jornada 2','2026-03-22 18:48:28','2026-03-22 18:48:28'),(3,'Jornada 3','2026-05-02 00:20:56','2026-05-02 00:20:56');
/*!40000 ALTER TABLE `jornadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jugadores`
--

DROP TABLE IF EXISTS `jugadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jugadores` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `equipo_categoria_id` bigint(20) unsigned NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellidos` varchar(160) NOT NULL,
  `fecha_nac` date DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `numero` tinyint(3) unsigned NOT NULL,
  `estatura` decimal(4,2) DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `alergias` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nombre_papa` varchar(160) DEFAULT NULL,
  `nombre_mama` varchar(160) DEFAULT NULL,
  `escuela` varchar(180) DEFAULT NULL,
  `grado_escolar` varchar(80) DEFAULT NULL,
  `telefono_casa` varchar(40) DEFAULT NULL,
  `telefono_mama` varchar(40) DEFAULT NULL,
  `telefono_papa` varchar(40) DEFAULT NULL,
  `tipo_sanguineo` varchar(12) DEFAULT NULL,
  `tarjetas_amarillas_acum` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `suspension_restante` tinyint(3) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_jugadores_equipo_categoria` (`equipo_categoria_id`),
  CONSTRAINT `fk_jugador_equipo_categoria` FOREIGN KEY (`equipo_categoria_id`) REFERENCES `equipo_categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jugadores`
--

LOCK TABLES `jugadores` WRITE;
/*!40000 ALTER TABLE `jugadores` DISABLE KEYS */;
INSERT INTO `jugadores` VALUES (1,1,'Andrés','López Martínez','2016-03-12',NULL,1,1.44,38.80,'Ninguna',1,'2026-03-10 00:01:22','2026-03-23 03:16:44',NULL,NULL,'JOSE VASCONCELOS',NULL,NULL,NULL,NULL,NULL,0,0),(2,1,'Carlos','Pérez Rodríguez','2016-07-04',NULL,5,1.28,27.50,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(3,1,'Diego','García Sánchez','2015-11-20',NULL,9,1.32,29.00,'Polen',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(4,1,'Ernesto','Ruiz Torres','2016-01-15',NULL,7,1.27,26.00,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(6,2,'Gabriel','Hernández Reyes','2013-04-22',NULL,1,1.48,38.00,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(7,2,'Hugo','Vega Morales','2013-08-16',NULL,4,1.45,36.50,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(8,2,'Iván','Castillo Jiménez','2014-02-08',NULL,9,1.50,40.00,'Maní',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(9,2,'Javier','Romero Flores','2013-12-01',NULL,7,1.47,37.00,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(10,2,'Kevin','Serrano Ortiz','2014-05-19',NULL,11,1.46,37.50,'Gluten',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(11,3,'Luis','Navarro Guzmán','2010-06-14',NULL,1,1.68,55.00,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(12,3,'Marco','Delgado Paredes','2011-01-23',NULL,5,1.65,52.00,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(13,3,'Nacho','Ríos Contreras','2010-09-07',NULL,9,1.70,58.00,'Ninguna',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(14,3,'Óscar','Fuentes Vargas','2011-03-30',NULL,7,1.63,50.00,'Polen',1,'2026-03-10 00:01:22','2026-03-10 00:01:22',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(15,3,'Pablo','Aguilar Ramos','2010-11-11',NULL,10,1.72,60.00,'Ninguna',1,'2026-03-10 00:01:22','2026-04-26 02:17:34',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,0),(16,6,'Luis','Lopez','2010-06-17',NULL,10,1.60,54.00,'ninguna',1,'2026-03-22 18:51:59','2026-03-22 18:51:59',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(17,6,'Jose','hernadez','2012-06-20',NULL,7,1.65,70.00,NULL,1,'2026-03-22 18:52:38','2026-03-22 18:52:38',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(18,6,'FERNANDO','ROMO','2012-06-13',NULL,54,1.67,65.00,NULL,1,'2026-03-22 18:53:07','2026-04-26 02:35:30',NULL,NULL,NULL,NULL,'5568829616',NULL,NULL,NULL,0,0),(19,7,'Manuel','Landin','2013-06-14',NULL,10,1.70,70.00,'ninguna',1,'2026-03-23 02:46:41','2026-03-23 02:46:41',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(20,7,'Jose','Luis','2012-01-10',NULL,11,1.69,80.00,'ninguna',1,'2026-03-23 02:50:40','2026-03-23 02:50:40',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(21,6,'FERNANDO','ROMO','2026-03-16',NULL,2,1.65,60.00,'ninguna',1,'2026-03-23 02:54:33','2026-03-23 02:54:33',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0),(22,6,'Manuel','Landin','2010-02-02',NULL,11,1.64,55.00,'ninguna',1,'2026-05-01 01:47:10','2026-05-01 01:47:10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,0);
/*!40000 ALTER TABLE `jugadores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `noticias`
--

DROP TABLE IF EXISTS `noticias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `noticias` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(200) NOT NULL,
  `contenido` text NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `orden` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_noticias_orden` (`orden`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `noticias`
--

LOCK TABLES `noticias` WRITE;
/*!40000 ALTER TABLE `noticias` DISABLE KEYS */;
INSERT INTO `noticias` VALUES (1,'noticia 1','ji9whq9hsi9qh','/v1_LDF/img/noticia_1/foto_1773717018_884.png',1,1,'2026-03-17 03:10:18','2026-03-17 03:10:18'),(2,'PSG GANA','GANAN PARTIDO','/v1_LDF/img/psg_gana/foto_1773717098_450.jpg',5,1,'2026-03-17 03:11:38','2026-03-17 03:11:38'),(5,'GUFYGFG','JGUGUH','/v1_LDF/img/gufygfg/foto_1773717989_112.jpg',4,1,'2026-03-17 03:26:29','2026-03-17 03:26:29');
/*!40000 ALTER TABLE `noticias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partido_alineaciones`
--

DROP TABLE IF EXISTS `partido_alineaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partido_alineaciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `partido_id` bigint(20) unsigned NOT NULL,
  `jugador_id` bigint(20) unsigned NOT NULL,
  `equipo_categoria_id` bigint(20) unsigned NOT NULL,
  `lado` enum('local','visita') NOT NULL,
  `amarillas` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `roja` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_partido_jugador` (`partido_id`,`jugador_id`),
  KEY `fk_alineacion_jugador` (`jugador_id`),
  KEY `fk_alineacion_ec` (`equipo_categoria_id`),
  CONSTRAINT `fk_alineacion_ec` FOREIGN KEY (`equipo_categoria_id`) REFERENCES `equipo_categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alineacion_jugador` FOREIGN KEY (`jugador_id`) REFERENCES `jugadores` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_alineacion_partido` FOREIGN KEY (`partido_id`) REFERENCES `partidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partido_alineaciones`
--

LOCK TABLES `partido_alineaciones` WRITE;
/*!40000 ALTER TABLE `partido_alineaciones` DISABLE KEYS */;
INSERT INTO `partido_alineaciones` VALUES (1,4,11,3,'local',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(2,4,12,3,'local',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(3,4,14,3,'local',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(4,4,13,3,'local',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(5,4,15,3,'local',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(6,4,17,6,'visita',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(7,4,16,6,'visita',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(8,4,18,6,'visita',0,0,'2026-03-22 18:54:49','2026-03-22 18:54:49'),(9,6,11,3,'local',0,0,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(10,6,12,3,'local',0,0,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(11,6,14,3,'local',0,0,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(12,6,15,3,'local',1,0,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(13,6,21,6,'visita',0,0,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(14,6,17,6,'visita',0,0,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(15,6,18,6,'visita',0,1,'2026-04-26 02:17:22','2026-04-26 02:17:22'),(16,7,21,6,'local',0,0,'2026-04-26 02:35:23','2026-04-26 02:35:23'),(17,7,17,6,'local',0,0,'2026-04-26 02:35:23','2026-04-26 02:35:23'),(18,8,21,6,'local',0,0,'2026-05-02 00:23:56','2026-05-02 00:23:56'),(19,8,17,6,'local',0,0,'2026-05-02 00:23:56','2026-05-02 00:23:56'),(20,8,16,6,'local',0,0,'2026-05-02 00:23:56','2026-05-02 00:23:56'),(21,8,22,6,'local',0,0,'2026-05-02 00:23:56','2026-05-02 00:23:56'),(22,8,13,3,'visita',0,0,'2026-05-02 00:23:56','2026-05-02 00:23:56'),(23,8,15,3,'visita',0,0,'2026-05-02 00:23:56','2026-05-02 00:23:56');
/*!40000 ALTER TABLE `partido_alineaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partidos`
--

DROP TABLE IF EXISTS `partidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partidos` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `equipo_categoria_local_id` bigint(20) unsigned NOT NULL,
  `equipo_categoria_visita_id` bigint(20) unsigned NOT NULL,
  `arbitro_id` bigint(20) unsigned DEFAULT NULL,
  `jornada_id` bigint(20) unsigned NOT NULL,
  `fecha` datetime NOT NULL,
  `goles_local` tinyint(3) unsigned DEFAULT NULL,
  `goles_visita` tinyint(3) unsigned DEFAULT NULL,
  `comentario` text DEFAULT NULL,
  `estado` enum('programado','jugado','cancelado') NOT NULL DEFAULT 'programado',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `disciplina_aplicada` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_partido_equipo_local` (`equipo_categoria_local_id`),
  KEY `fk_partido_equipo_visita` (`equipo_categoria_visita_id`),
  KEY `fk_partido_arbitro` (`arbitro_id`),
  KEY `idx_partidos_fecha` (`fecha`),
  KEY `idx_partidos_jornada` (`jornada_id`),
  CONSTRAINT `fk_partido_arbitro` FOREIGN KEY (`arbitro_id`) REFERENCES `arbitros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_partido_equipo_local` FOREIGN KEY (`equipo_categoria_local_id`) REFERENCES `equipo_categoria` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_partido_equipo_visita` FOREIGN KEY (`equipo_categoria_visita_id`) REFERENCES `equipo_categoria` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_partido_jornada` FOREIGN KEY (`jornada_id`) REFERENCES `jornadas` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `chk_partido_distintos_equipos` CHECK (`equipo_categoria_local_id` <> `equipo_categoria_visita_id`)
) ENGINE=InnoDB AUTO_INCREMENT=897 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partidos`
--

LOCK TABLES `partidos` WRITE;
/*!40000 ALTER TABLE `partidos` DISABLE KEYS */;
INSERT INTO `partidos` VALUES (1,4,1,1,1,'2026-03-21 20:04:00',2,0,'CU','jugado','2026-03-15 02:04:45','2026-03-22 18:47:50',1),(2,3,4,1,1,'2026-03-21 21:16:00',3,2,'CU','jugado','2026-03-17 03:17:07','2026-03-22 18:47:50',1),(3,3,4,1,1,'2026-03-23 21:18:00',NULL,NULL,'CU','programado','2026-03-17 03:19:03','2026-03-22 18:47:50',0),(4,3,6,3,2,'2026-03-25 12:00:00',1,3,'PLAN SEXENAL','jugado','2026-03-22 18:54:26','2026-03-22 19:48:51',1),(5,4,6,1,2,'2026-03-23 20:18:00',NULL,NULL,'PLAN SEXENAL','programado','2026-03-23 02:18:43','2026-03-23 02:18:43',0),(6,3,6,3,2,'2026-04-26 20:06:00',3,6,'CU','jugado','2026-04-26 02:06:32','2026-04-26 02:17:34',1),(7,6,8,1,2,'2026-04-27 12:38:00',1,2,'CU','jugado','2026-04-26 02:34:51','2026-04-26 02:35:30',1),(8,6,3,3,3,'2026-05-21 18:22:00',2,2,'DGUHWGDUHYWGUYD','jugado','2026-05-02 00:22:45','2026-05-02 00:24:04',1);
/*!40000 ALTER TABLE `partidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tabla_posiciones`
--

DROP TABLE IF EXISTS `tabla_posiciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tabla_posiciones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `equipo_categoria_id` bigint(20) unsigned NOT NULL,
  `pj` smallint(5) unsigned NOT NULL DEFAULT 0,
  `g` smallint(5) unsigned NOT NULL DEFAULT 0,
  `e` smallint(5) unsigned NOT NULL DEFAULT 0,
  `p` smallint(5) unsigned NOT NULL DEFAULT 0,
  `gf` smallint(5) unsigned NOT NULL DEFAULT 0,
  `gc` smallint(5) unsigned NOT NULL DEFAULT 0,
  `puntos` smallint(5) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tabla_equipo_categoria` (`equipo_categoria_id`),
  CONSTRAINT `fk_tabla_equipo_categoria` FOREIGN KEY (`equipo_categoria_id`) REFERENCES `equipo_categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=159 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tabla_posiciones`
--

LOCK TABLES `tabla_posiciones` WRITE;
/*!40000 ALTER TABLE `tabla_posiciones` DISABLE KEYS */;
INSERT INTO `tabla_posiciones` VALUES (1,1,1,0,0,1,0,2,0,'2026-03-10 00:01:22','2026-03-15 02:14:43'),(2,2,0,0,0,0,0,0,0,'2026-03-10 00:01:22','2026-03-10 00:01:22'),(3,3,4,1,1,2,9,13,4,'2026-03-10 00:01:22','2026-05-02 00:24:04'),(4,4,2,1,0,1,4,3,3,'2026-03-15 02:14:43','2026-03-17 03:17:29'),(5,6,4,2,1,1,12,8,7,'2026-03-22 19:48:51','2026-05-02 00:24:04'),(6,8,1,1,0,0,2,1,3,'2026-04-26 02:35:30','2026-04-26 02:35:30');
/*!40000 ALTER TABLE `tabla_posiciones` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-08 21:10:19
