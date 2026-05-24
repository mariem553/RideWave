-- À exécuter une fois sur une base déjà créée (avant cette évolution).
-- Ajoute catégorie, carburant, transmission, places à la table voitures.

USE locationvoiture_db;

ALTER TABLE voitures
  ADD COLUMN categorie VARCHAR(60) NOT NULL DEFAULT 'Berline' AFTER disponible,
  ADD COLUMN carburant VARCHAR(60) NOT NULL DEFAULT 'Essence' AFTER categorie,
  ADD COLUMN transmission VARCHAR(60) NOT NULL DEFAULT 'Auto' AFTER carburant,
  ADD COLUMN places TINYINT UNSIGNED NOT NULL DEFAULT 5 AFTER transmission;
