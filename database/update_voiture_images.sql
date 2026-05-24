-- Si vous aviez des URLs HTTPS dans image_url, repassez aux chemins locaux
-- (fichiers dans public/images/voitures/ — servis sous /images/voitures/...)

USE locationvoiture_db;

UPDATE voitures SET image_url = '/images/voitures/corolla.jpg'   WHERE id = 1;
UPDATE voitures SET image_url = '/images/voitures/clio.jpg'      WHERE id = 2;
UPDATE voitures SET image_url = '/images/voitures/golf.jpg'      WHERE id = 3;
UPDATE voitures SET image_url = '/images/voitures/peugeot308.jpg' WHERE id = 4;
UPDATE voitures SET image_url = '/images/voitures/sandero.jpg'   WHERE id = 5;
