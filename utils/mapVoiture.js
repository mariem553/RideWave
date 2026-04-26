// mapVoiture.js — normalisation des données véhicule
// Ce fichier prépare les objets voiture pour l'API en nettoyant les champs,
// convertissant les types, en fournissant des valeurs par défaut et en
// gérant l'URL de l'image ou une image de remplacement.
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

  const descRaw = row.description;
  const description =
    descRaw != null && String(descRaw).trim() !== ""
      ? String(descRaw).trim()
      : null;

  const optStr = (key) => {
    const x = row[key];
    if (x == null || String(x).trim() === "") return null;
    return String(x).trim();
  };

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
    description,
    puissance_cv: optStr("puissance_cv"),
    vitesse_max_kmh: optStr("vitesse_max_kmh"),
    accel_0_100: optStr("accel_0_100"),
    popularite: 70,
    photo,
  };
}

module.exports = { mapVoiture, PLACEHOLDER_IMG };

// Ce fichier transforme les lignes SQL des voitures en objets JSON expurgés et prêts pour le front.

