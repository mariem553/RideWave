/**
 * Forme JSON commune pour GET /api/voitures et réponses admin POST/PUT.
 */
const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=80";

function strOr(row, key, fallback) {
  const v = row[key];
  if (v == null) return fallback;
  const s = String(v).trim();
  return s !== "" ? s : fallback;
}

function mapVoiture(row) {
  let photo = row.image_url || "";
  if (!photo) {
    photo = PLACEHOLDER_IMG;
  } else if (!photo.startsWith("http")) {
    photo = photo.startsWith("/") ? photo : `/${photo}`;
  }

  let places = parseInt(row.places, 10);
  if (Number.isNaN(places) || places < 1) places = 5;
  if (places > 99) places = 99;

  return {
    id: row.id,
    marque: row.marque,
    modele: row.modele,
    annee: row.annee,
    prix_jour: Number(row.prix_jour),
    disponible: Boolean(row.disponible),
    categorie: strOr(row, "categorie", "Berline"),
    carburant: strOr(row, "carburant", "Essence"),
    transmission: strOr(row, "transmission", "Auto"),
    places,
    popularite: 70,
    photo,
  };
}

module.exports = { mapVoiture, PLACEHOLDER_IMG };
