-- ============================================
--  locationvoiture_db — Seed data
--  1 admin + 2 clients + 5 voitures
-- ============================================

USE locationvoiture_db;

-- ─────────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────────
INSERT INTO users (nom, email, password, role) VALUES
  ('Admin RideWave',  'admin@ridewave.com', 'admin123',  'admin'),
  ('Ahmed Ben Ali',   'ahmed@email.com',    'client123', 'client'),
  ('Sana Trabelsi',   'sana@email.com',     'client123', 'client');

-- ─────────────────────────────────────────────
--  VOITURES
-- ─────────────────────────────────────────────
INSERT INTO voitures (marque, modele, annee, prix_jour, image_url, disponible) VALUES
  ('Toyota',    'Corolla',   2021, 85.00,  '/images/voitures/corolla.jpg',   1),
  ('Renault',   'Clio',      2022, 65.00,  '/images/voitures/clio.jpg',      1),
  ('Volkswagen','Golf',      2020, 95.00,  '/images/voitures/golf.jpg',      1),
  ('Peugeot',   '308',       2023, 110.00, '/images/voitures/peugeot308.jpg',1),
  ('Dacia',     'Sandero',   2022, 55.00,  '/images/voitures/sandero.jpg',   0);

-- ─────────────────────────────────────────────
--  RESERVATIONS (exemples)
-- ─────────────────────────────────────────────
INSERT INTO reservations (user_id, voiture_id, date_debut, date_fin, total_prix, statut) VALUES
  (2, 1, '2026-03-10', '2026-03-13', 255.00, 'confirmee'),
  (3, 3, '2026-03-05', '2026-03-07', 190.00, 'annulee');