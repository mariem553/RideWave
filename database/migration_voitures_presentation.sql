-- Texte d'accueil + specs carte (optionnel). À exécuter une fois si la table existe déjà sans ces colonnes.

USE locationvoiture_db;

ALTER TABLE voitures
  ADD COLUMN description TEXT NULL AFTER places,
  ADD COLUMN puissance_cv VARCHAR(20) NULL DEFAULT NULL AFTER description,
  ADD COLUMN vitesse_max_kmh VARCHAR(20) NULL DEFAULT NULL AFTER puissance_cv,
  ADD COLUMN accel_0_100 VARCHAR(20) NULL DEFAULT NULL AFTER vitesse_max_kmh;
