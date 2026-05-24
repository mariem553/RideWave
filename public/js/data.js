/* ═══════════════════════════════════════════════════════════════
   data.js — données statiques de démonstration
   Description :
   - contient une flotte de véhicules factice pour la phase 1
   - utilise des données locales avant migration vers l'API
   - chaque objet véhicule fournit les champs nécessaires au catalogue
   ═══════════════════════════════════════════════════════════════ */

const VOITURES = [
  {id:1, marque:'Mercedes-Benz', modele:'Classe E 220d',   annee:2023, prix_jour:320, disponible:true,  categorie:'Berline',    carburant:'Diesel',     transmission:'Auto',   places:5, popularite:92, photo:'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80'},
  {id:2, marque:'BMW',           modele:'Série 5 530i',    annee:2023, prix_jour:350, disponible:true,  categorie:'Berline',    carburant:'Essence',    transmission:'Auto',   places:5, popularite:88, photo:'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80'},
  {id:3, marque:'Audi',          modele:'A6 Quattro',      annee:2022, prix_jour:280, disponible:false, categorie:'Berline',    carburant:'Essence',    transmission:'Auto',   places:5, popularite:75, photo:'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80'},
  {id:4, marque:'Porsche',       modele:'Cayenne S',       annee:2023, prix_jour:480, disponible:true,  categorie:'SUV',        carburant:'Essence',    transmission:'Auto',   places:5, popularite:96, photo:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80'},
  {id:5, marque:'Range Rover',   modele:'Velar P400',      annee:2023, prix_jour:420, disponible:true,  categorie:'SUV',        carburant:'Essence',    transmission:'Auto',   places:5, popularite:90, photo:'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80'},
  {id:6, marque:'Tesla',         modele:'Model 3 Performance', annee:2024, prix_jour:290, disponible:true, categorie:'Électrique', carburant:'Électrique', transmission:'Auto', places:5, popularite:94, photo:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80'},
  {id:7, marque:'Mercedes-Benz', modele:'GLE 450 AMG',     annee:2024, prix_jour:500, disponible:false, categorie:'SUV',        carburant:'Hybride',    transmission:'Auto',   places:7, popularite:85, photo:'https://images.unsplash.com/photo-1547744152-14d985cb937f?w=800&q=80'},
  {id:8, marque:'Volkswagen',    modele:'Passat Business', annee:2022, prix_jour:140, disponible:true,  categorie:'Berline',    carburant:'Diesel',     transmission:'Auto',   places:5, popularite:62, photo:'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&q=80'},
  {id:9, marque:'Toyota',        modele:'RAV4 Hybrid',     annee:2023, prix_jour:165, disponible:true,  categorie:'SUV',        carburant:'Hybride',    transmission:'Auto',   places:5, popularite:78, photo:'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80'},
  {id:10,marque:'Audi',          modele:'Q7 S-Line',       annee:2023, prix_jour:390, disponible:true,  categorie:'SUV',        carburant:'Diesel',     transmission:'Auto',   places:7, popularite:82, photo:'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=80'},
  {id:11,marque:'BMW',           modele:'X5 xDrive40i',    annee:2022, prix_jour:440, disponible:false, categorie:'SUV',        carburant:'Essence',    transmission:'Auto',   places:5, popularite:87, photo:'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80'},
  {id:12,marque:'Volkswagen',    modele:'Golf 8 GTI',      annee:2022, prix_jour:110, disponible:true,  categorie:'Compacte',   carburant:'Essence',    transmission:'Manuel', places:5, popularite:70, photo:'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80'},
];

// Données statiques de démonstration pour la page catalogue. À remplacer par une API plus tard.

