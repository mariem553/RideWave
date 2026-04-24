-- ============================================
--  RideWave — Installation complète MySQL
--  Schéma + données de test (un seul script pour Workbench)
-- ============================================

CREATE DATABASE IF NOT EXISTS locationvoiture_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE locationvoiture_db;

-- ─────────────────────────────────────────────
--  TABLE : users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nom        VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(100) NOT NULL,
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
  categorie    VARCHAR(60)  NOT NULL DEFAULT 'Berline',
  carburant    VARCHAR(60)  NOT NULL DEFAULT 'Essence',
  transmission VARCHAR(60)  NOT NULL DEFAULT 'Auto',
  places       TINYINT UNSIGNED NOT NULL DEFAULT 5,
  description      TEXT         NULL,
  puissance_cv     VARCHAR(20)  NULL DEFAULT NULL,
  vitesse_max_kmh  VARCHAR(20)  NULL DEFAULT NULL,
  accel_0_100      VARCHAR(20)  NULL DEFAULT NULL,
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
  num_carte_identite VARCHAR(30) NOT NULL,
  client_prenom VARCHAR(100) NOT NULL,
  client_nom    VARCHAR(100) NOT NULL,
  client_email  VARCHAR(150) NOT NULL,
  client_telephone VARCHAR(30) NOT NULL,
  option_chauffeur TINYINT(1) NOT NULL DEFAULT 0,
  total_prix  DECIMAL(10,2)  NOT NULL,
  statut      ENUM('confirmee','annulee','terminee') NOT NULL DEFAULT 'confirmee',
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_reservation_user
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  CONSTRAINT fk_reservation_voiture
    FOREIGN KEY (voiture_id) REFERENCES voitures(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────
--  SEED
-- ─────────────────────────────────────────────
INSERT INTO users (nom, email, password, role) VALUES
  ('Admin RideWave',  'admin@ridewave.com', 'admin123',  'admin'),
  ('Ahmed Ben Ali',   'ahmed@email.com',    'client123', 'client'),
  ('Sana Trabelsi',   'sana@email.com',     'client123', 'client');

INSERT INTO voitures (marque, modele, annee, prix_jour, image_url, disponible) VALUES
  ('Toyota',    'Corolla',   2021, 85.00,  '/images/voitures/corolla.jpg',   1),
  ('Renault',   'Clio',      2022, 65.00,  '/images/voitures/clio.jpg',      1),
  ('Volkswagen','Golf',      2020, 95.00,  '/images/voitures/golf.jpg',      1),
  ('Peugeot',   '308',       2023, 110.00, '/images/voitures/peugeot308.jpg',1),
  ('Dacia',     'Sandero',   2022, 55.00,  '/images/voitures/sandero.jpg',   0);

INSERT INTO reservations (user_id, voiture_id, date_debut, date_fin, num_carte_identite, client_prenom, client_nom, client_email, client_telephone, option_chauffeur, total_prix, statut) VALUES
  (2, 1, '2026-03-10', '2026-03-13', '12345678', 'Ahmed', 'Ben Ali', 'ahmed@email.com', '20000000', 0, 255.00, 'confirmee'),
  (3, 3, '2026-03-05', '2026-03-07', '87654321', 'Sana', 'Trabelsi', 'sana@email.com', '90000000', 0, 190.00, 'annulee');
