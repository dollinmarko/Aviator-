/**
 * ==========================================
 * AVIATOR SIGNAL — FORMULE D'ANALYSE
 * CIBLE ROSE : X5.00 → X49.99
 * ==========================================
 */

export interface FormuleDetails {
  secondes_cible: number;
  valeur_temps: number;
  variation: number;
  coherence_temps: number;
  coherence_cote: number;
  cote_brute: number;
}

export interface AnalyseSignalResultat {
  erreur?: string;
  categorie?: 'ROSE';
  derniere_heure?: string;
  derniere_cote?: string;
  derniere_cote_num?: number;
  intervalle?: string;
  intervalle_secondes?: number;
  heure_cible?: string;
  cote_cible?: string;
  cote_cible_num?: number;
  confiance?: string;
  confiance_num?: number;
  details?: FormuleDetails;
}

/**
 * Analyse le signal selon la formule expérimentale Cible Rose Aviator
 * @param derniere_heure Heure au format "HH:MM:SS" (ou "HH:MM")
 * @param derniere_cote Multiplicateur flottant > 0
 */
export function analyser_signal(
  derniere_heure: string,
  derniere_cote: string | number
): AnalyseSignalResultat {
  // ------------------------------------------
  // 1. VERIFICATION FORMAT HEURE
  // ------------------------------------------
  const heureRaw = String(derniere_heure || '').trim();
  let heureStr = heureRaw;

  // Si l'utilisateur entre HH:MM, on ajoute les secondes :00 automatiquement
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(heureRaw)) {
    heureStr = `${heureRaw}:00`;
  }

  const timeMatch = heureStr.match(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/);
  if (!timeMatch) {
    return {
      erreur: 'Format incorrect. Utilisez HH:MM:SS',
    };
  }

  const inHour = parseInt(timeMatch[1], 10);
  const inMinute = parseInt(timeMatch[2], 10);
  const inSecond = parseInt(timeMatch[3], 10);

  // ------------------------------------------
  // 2. VERIFICATION COTE
  // ------------------------------------------
  const cote =
    typeof derniere_cote === 'number'
      ? derniere_cote
      : parseFloat(String(derniere_cote).replace(',', '.'));

  if (isNaN(cote)) {
    return {
      erreur: 'La côte doit être un nombre.',
    };
  }

  if (cote <= 0) {
    return {
      erreur: 'La côte doit être supérieure à 0.',
    };
  }

  // ==========================================
  // 3. FORMULE TEMPS CIBLE
  // ==========================================
  // Fenêtre expérimentale ROSE
  const intervalle = 169; // secondes (+2 min 49 sec)

  // Total des secondes du point de départ + intervalle
  let totalSecondes = inHour * 3600 + inMinute * 60 + inSecond + intervalle;

  // Gestion du passage à minuit (24h = 86400 secondes)
  totalSecondes = ((totalSecondes % 86400) + 86400) % 86400;

  const h = Math.floor(totalSecondes / 3600);
  const m = Math.floor((totalSecondes % 3600) / 60);
  const s = totalSecondes % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  const heure_cible = `${pad(h)}:${pad(m)}:${pad(s)}`;

  // Conversion de l'heure cible en secondes
  const secondes_cible = h * 3600 + m * 60 + s;

  // ==========================================
  // 4. FORMULE ANALYSE COTE
  // ==========================================
  // Variation basée sur la position temporelle
  // de l'heure cible + dernière côte.
  const valeur_temps = h * 0.15 + m * 0.08 + s * 0.03;

  // Variation mathématique expérimentale
  const variation = Math.sin(secondes_cible / 60) + Math.cos(cote);

  // Calcul estimation
  const cote_brute = cote + valeur_temps + variation;
  let cote_cible = cote_brute;

  // ==========================================
  // 5. LIMITATION CATEGORIE ROSE
  // ==========================================
  cote_cible = Math.max(5.0, Math.min(cote_cible, 49.99));
  cote_cible = Math.round(cote_cible * 100) / 100;

  // ==========================================
  // 6. CALCUL POURCENTAGE
  // ==========================================
  // Cohérence temporelle
  const coherence_temps = 80 + (secondes_cible % 15);

  // Influence de la côte
  const coherence_cote = Math.min(cote * 2, 10);

  // Pourcentage final
  let confiance = coherence_temps + coherence_cote;

  // Limitation
  confiance = Math.min(confiance, 95);
  confiance = Math.round(confiance * 10) / 10;

  // ==========================================
  // RESULTAT
  // ==========================================
  return {
    categorie: 'ROSE',
    derniere_heure: heureStr,
    derniere_cote: `x${cote.toFixed(2)}`,
    derniere_cote_num: cote,
    intervalle: `+${intervalle} secondes`,
    intervalle_secondes: intervalle,
    heure_cible,
    cote_cible: `x${cote_cible.toFixed(2)}`,
    cote_cible_num: cote_cible,
    confiance: `${confiance}%`,
    confiance_num: confiance,
    details: {
      secondes_cible,
      valeur_temps: Math.round(valeur_temps * 1000) / 1000,
      variation: Math.round(variation * 1000) / 1000,
      coherence_temps,
      coherence_cote: Math.round(coherence_cote * 100) / 100,
      cote_brute: Math.round(cote_brute * 100) / 100,
    },
  };
}

export const calculateAviatorSignal = analyser_signal;
