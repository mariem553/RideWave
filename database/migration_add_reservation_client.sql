-- À exécuter dans Workbench si la table reservations existe déjà SANS les colonnes client_*
-- (sinon erreur "Duplicate column")

USE locationvoiture_db;

ALTER TABLE reservations
  ADD COLUMN client_prenom VARCHAR(100) NOT NULL DEFAULT '' AFTER num_carte_identite,
  ADD COLUMN client_nom VARCHAR(100) NOT NULL DEFAULT '' AFTER client_prenom,
  ADD COLUMN client_email VARCHAR(150) NOT NULL DEFAULT '' AFTER client_nom,
  ADD COLUMN client_telephone VARCHAR(30) NOT NULL DEFAULT '' AFTER client_email,
  ADD COLUMN option_chauffeur TINYINT(1) NOT NULL DEFAULT 0 AFTER client_telephone;

-- Retirer les DEFAULT inutiles après migration des anciennes lignes (optionnel) :
-- ALTER TABLE reservations MODIFY client_prenom VARCHAR(100) NOT NULL;
