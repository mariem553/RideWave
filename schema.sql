-- ============================================
--  locationvoiture_db — Schema complet
--  Tables : users, voitures, reservations
-- ============================================

CREATE DATABASE IF NOT EXISTS locationvoiture_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE locationvoiture_db;

-- ─────────────────────────────────────────────
--  TABLE : users  (clients ET admins — une seule table)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(100) NOT NULL,          -- stocké en texte clair
  role       ENUM('client','admin') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  TABLE : voitures
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS voitures (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  marque     VARCHAR(80)    NOT NULL,
  modele     VARCHAR(80)    NOT NULL,
  annee      YEAR           NOT NULL,
  prix_jour  DECIMAL(8,2)   NOT NULL,
  image_url  VARCHAR(255)   DEFAULT NULL,
  disponible TINYINT(1)     NOT NULL DEFAULT 1,
  created_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  TABLE : reservations
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  voiture_id  INT            NOT NULL,
  date_debut  DATE           NOT NULL,
  date_fin    DATE           NOT NULL,
  total_prix  DECIMAL(10,2)  NOT NULL,
  statut      ENUM('confirmee','annulee') NOT NULL DEFAULT 'confirmee',
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reservation_user
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_reservation_voiture
    FOREIGN KEY (voiture_id) REFERENCES voitures(id) ON DELETE RESTRICT
) ENGINE=InnoDB;