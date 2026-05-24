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
--  VOITURES  (images : public/images/voitures/*.jpg → URL web /images/voitures/...)
-- ─────────────────────────────────────────────
INSERT INTO voitures (marque, modele, annee, prix_jour, image_url, disponible, categorie, carburant, transmission, places, description) VALUES
  ('Toyota',    'Corolla',   2021, 85.00,  '/images/voitures/corolla.jpg',   1, 'Berline', 'Essence', 'Auto', 5, 'Voiture fiable et économique'),
  ('Renault',   'Clio',      2022, 65.00,  '/images/voitures/clio.jpg',      1, 'Citadine', 'Essence', 'Manuel', 5, 'Petit budget, grand confort'),
  ('Volkswagen','Golf',      2020, 95.00,  '/images/voitures/golf.jpg',      1, 'Berline', 'Essence', 'Auto', 5, 'Voiture sportive et dynamique'),
  ('Peugeot',   '308',       2023, 110.00, '/images/voitures/peugeot308.jpg',1, 'Berline', 'Diesel', 'Auto', 5, 'Design moderne et performante'),
  ('Dacia',     'Sandero',   2022, 55.00,  '/images/voitures/sandero.jpg',   0, 'SUV', 'Essence', 'Manuel', 5, 'Robuste et économique'),
  ('BMW',       'X6',        2023, 180.00, '/images/voitures/bmw-x6.webp',   1, 'SUV Luxe', 'Essence', 'Auto', 5, 'Puissance et élégance'),
  ('Fiat',      '500X',      2022, 78.00,  '/images/voitures/fiat500X.jpg',  1, 'SUV', 'Essence', 'Auto', 5, 'Compact et maniable'),
  ('Ford',      'Ranger',    2023, 145.00, '/images/voitures/Ford-Ranger.jpg', 1, 'Pickup', 'Diesel', 'Auto', 5, 'Puissant et spacieux'),
  ('Hyundai',   'Tucson',    2022, 92.00,  '/images/voitures/hyundai Tucson.jpg', 1, 'SUV', 'Essence', 'Auto', 5, 'Moderne et fonctionnel'),
  ('Kia',       'Sportage',  2023, 100.00, '/images/voitures/kia-sportage.jpg', 1, 'SUV', 'Essence', 'Auto', 5, 'Style et performance'),
  ('Lamborghini','Urus',     2023, 500.00, '/images/voitures/lamborghini-urus.jpg', 1, 'SUV Luxe', 'Essence', 'Auto', 4, 'Luxe extrême et puissance'),
  ('Mercedes-Benz', 'AMG A45', 2023, 250.00, '/images/voitures/mercedes-amgA45.jpg', 1, 'Berline Luxe', 'Essence', 'Auto', 5, 'Performance et prestige'),
  ('Mini',      'Cooper',    2022, 88.00,  '/images/voitures/mini cooper.jpg', 1, 'Citadine', 'Essence', 'Auto', 4, 'Rétro chic et ludique'),
  ('Porsche',   '911',       2023, 450.00, '/images/voitures/porsche-911.jpg', 1, 'Sport', 'Essence', 'Auto', 2, 'Sportive légendaire'),
  ('Land Rover','Range Rover', 2023, 220.00, '/images/voitures/Range Rover.jpg', 1, 'SUV Luxe', 'Diesel', 'Auto', 5, 'Adventure et confort'),
  ('Kia',       'Stonic',    2022, 85.00,  '/images/voitures/S0-modele--kia-stonic.jpg', 1, 'SUV', 'Essence', 'Auto', 5, 'Compact urbain'),
  ('Toyota',    'Yaris Cross Hybride', 2023, 105.00, '/images/voitures/toyota-yaris-cross-hybride.jpg', 1, 'SUV', 'Hybride', 'Auto', 5, 'Écologique et économe'),
  ('Toyota',    'Prado',     2023, 135.00, '/images/voitures/toyota_prado.jpg', 1, 'SUV', 'Diesel', 'Auto', 7, 'Grand confort familial');

-- ─────────────────────────────────────────────
--  RESERVATIONS (exemples)
-- ─────────────────────────────────────────────
INSERT INTO reservations (user_id, voiture_id, date_debut, date_fin, num_carte_identite, client_prenom, client_nom, client_email, client_telephone, option_chauffeur, total_prix, statut) VALUES
  (2, 1, '2026-03-10', '2026-03-13', '12345678', 'Ahmed', 'Ben Ali', 'ahmed@email.com', '20000000', 0, 255.00, 'confirmee'),
  (3, 3, '2026-03-05', '2026-03-07', '87654321', 'Sana', 'Trabelsi', 'sana@email.com', '90000000', 0, 190.00, 'annulee');