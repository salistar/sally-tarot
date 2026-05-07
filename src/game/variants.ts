/**
 * @file variants.ts — Catalogue de toutes les variantes Tarot français.
 * Multi >1 joueur : socket+STUN/TURN+Jitsi via /room/create. Solo vs-ai sans socket.
 */

export type VariantKey =
  | 'tarot-4p-classic' | 'tarot-3p' | 'tarot-5p'
  | 'tarot-petite' | 'tarot-garde' | 'tarot-garde-sans' | 'tarot-garde-contre'
  | 'tarot-chelem-annonce'
  | 'vs-ai';

export interface Variant {
  key: VariantKey;
  engine: 'tarot' | 'vs-ai';
  emoji: string;
  name: string;
  shortDesc: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  winRate: string;
  duration: string;
  cards: number;
  rules: { title: string; body: string }[];
  available: boolean;
  options?: {
    players?: 3 | 4 | 5;
    contract?: 'petite' | 'garde' | 'garde-sans' | 'garde-contre' | 'free';
    multiplier?: 1 | 2 | 4 | 6;
    chelem?: 'announced';
    multi?: boolean;
  };
}

export const VARIANTS: Variant[] = [
  {
    key: 'tarot-4p-classic', engine: 'tarot', emoji: '🃏', name: 'Tarot 4 joueurs',
    shortDesc: 'Standard FFT, 18 cartes/joueur, chien de 6.',
    difficulty: 4, winRate: '~25%', duration: '~1h30', cards: 78, available: true,
    options: { players: 4, contract: 'free', multi: true },
    rules: [
      { title: 'Vue d\'ensemble', body: '4 joueurs, 1 preneur contre 3 défenseurs. 78 cartes.' },
      { title: 'Cartes', body: '4 couleurs (♠♥♦♣) × 14 cartes (1-10 + Valet, Cavalier, Dame, Roi) = 56 + 21 atouts (1 à 21) + 1 Excuse = 78.' },
      { title: 'Cavalier', body: 'Spécifique au Tarot : entre Valet (V) et Dame (D) dans la hiérarchie. Vaut 2,5 pts.' },
      { title: 'Bouts', body: '3 cartes maîtresses : Petit (atout 1), 21 (atout 21), Excuse. Chaque bout vaut 4,5 pts.' },
      { title: 'Distribution', body: 'Antihoraire, par paquets de 3. 18 cartes par joueur + 6 au chien (jamais en début/fin de distribution).' },
      { title: 'Phase d\'enchères', body: '4 contrats : Petite (×1), Garde (×2), Garde Sans le chien (×4), Garde Contre le chien (×6).' },
      { title: 'Écart (Petite/Garde)', body: 'Le preneur prend le chien (24 cartes), pose 6 cartes en écart (ne peut pas écarter Roi/atout/Excuse).' },
      { title: 'Garde Sans/Contre', body: 'Pas d\'écart : le chien est attribué au preneur (Sans) ou aux défenseurs (Contre).' },
      { title: 'Poignée', body: 'Annoncer 10/13/15 atouts en main = +20/+30/+40 points (l\'Excuse compte comme atout).' },
      { title: 'Règles strictes', body: 'Fournir la couleur. Si pas la couleur → couper avec atout. Si atout déjà joué → MONTER (atout supérieur si possible).' },
      { title: 'Excuse', body: 'Carte spéciale : ne perd ni ne gagne le pli. Tu la récupères dans tes plis et donnes une autre carte basse en échange.' },
      { title: 'Petit au Bout', body: 'Si tu fais le dernier pli avec le Petit (atout 1) = +10 points × multiplicateur.' },
      { title: 'Bouts et seuils', body: '0 bout = 56 pts, 1 bout = 51, 2 bouts = 41, 3 bouts = 36. Plus de bouts = moins de points requis.' },
      { title: 'Score', body: 'Score = (25 + |Pts − Seuil| + Petit au Bout + Poignée + Chelem) × Multiplicateur. Défenseurs reçoivent −Score, preneur +3×Score.' },
      { title: 'Victoire', body: 'Cumul sur N donnes (souvent 5 par joueur = 20 donnes). Joueur avec score cumulé le plus haut gagne.' },
    ],
  },
  {
    key: 'tarot-3p', engine: 'tarot', emoji: '👥', name: 'Tarot 3 joueurs',
    shortDesc: '3 joueurs, 24 cartes par joueur, chien de 6.',
    difficulty: 4, winRate: '~33%', duration: '~1h', cards: 78, available: true,
    options: { players: 3, contract: 'free', multi: true },
    rules: [
      { title: 'Différence', body: '24 cartes par joueur. Plus de cartes = plus stratégique.' },
      { title: 'Mêmes contrats', body: 'Petite, Garde, Garde Sans, Garde Contre.' },
    ],
  },
  {
    key: 'tarot-5p', engine: 'tarot', emoji: '🎲', name: 'Tarot 5 joueurs',
    shortDesc: '15 cartes/joueur, partenaire appelé (Roi appelé), chien de 3.',
    difficulty: 5, winRate: '~40%', duration: '~1h15', cards: 78, available: true,
    options: { players: 5, contract: 'free', multi: true },
    rules: [
      { title: 'Mode unique', body: 'Le preneur "appelle" un partenaire en annonçant un Roi (ex : "Roi de cœur").' },
      { title: 'Partenaire secret', body: 'Celui qui a ce Roi devient son partenaire. Il ne révèle qu\'en jouant la carte appelée.' },
      { title: 'Dynamique 2v3', body: 'Tu peux ne pas savoir qui est ton partenaire au début ! Très tactique.' },
      { title: 'Cas spécial', body: 'Si pas de Roi à appeler, le preneur appelle Dame/Cavalier/Valet.' },
      { title: 'Roi dans le chien', body: 'Si le Roi appelé est dans le chien, le preneur joue SEUL contre 4 !' },
    ],
  },
  {
    key: 'tarot-petite', engine: 'tarot', emoji: '🐣', name: 'Tarot Petite',
    shortDesc: 'Contrat Petite (×1) — niveau d\'engagement le plus bas.',
    difficulty: 3, winRate: '~30%', duration: '~1h30', cards: 78, available: true,
    options: { players: 4, contract: 'petite', multiplier: 1, multi: true },
    rules: [
      { title: 'Contrat', body: 'Multiplicateur ×1. Le preneur prend le chien et fait l\'écart.' },
      { title: 'Critères', body: 'Annoncer Petite avec ~8-10 atouts, 1 bout, et estimation 45+ points.' },
    ],
  },
  {
    key: 'tarot-garde', engine: 'tarot', emoji: '🛡️', name: 'Tarot Garde',
    shortDesc: 'Contrat Garde (×2) — main meilleure que Petite.',
    difficulty: 4, winRate: '~25%', duration: '~1h30', cards: 78, available: true,
    options: { players: 4, contract: 'garde', multiplier: 2, multi: true },
    rules: [{ title: 'Contrat', body: 'Multiplicateur ×2. Identique à Petite (chien + écart) mais double les gains/pertes.' }],
  },
  {
    key: 'tarot-garde-sans', engine: 'tarot', emoji: '🚫', name: 'Garde Sans',
    shortDesc: 'Contrat Garde Sans le chien (×4) — pas d\'écart.',
    difficulty: 5, winRate: '~20%', duration: '~1h30', cards: 78, available: true,
    options: { players: 4, contract: 'garde-sans', multiplier: 4, multi: true },
    rules: [
      { title: 'Contrat', body: '×4. Le chien n\'est pas regardé : il est attribué directement au preneur en fin de manche.' },
      { title: 'Critères', body: 'Très grosse main : 12+ atouts ou 3 bouts. Pas besoin du chien.' },
    ],
  },
  {
    key: 'tarot-garde-contre', engine: 'tarot', emoji: '⚔️', name: 'Garde Contre',
    shortDesc: 'Contrat Garde Contre (×6) — chien aux défenseurs.',
    difficulty: 5, winRate: '~15%', duration: '~1h30', cards: 78, available: true,
    options: { players: 4, contract: 'garde-contre', multiplier: 6, multi: true },
    rules: [
      { title: 'Contrat', body: '×6. Le chien est attribué AUX DÉFENSEURS en fin de manche.' },
      { title: 'Critères', body: 'Main exceptionnelle : tous les atouts maîtres déjà en main. Quasi imbattable.' },
    ],
  },
  {
    key: 'tarot-chelem-annonce', engine: 'tarot', emoji: '👑', name: 'Chelem Annoncé',
    shortDesc: 'Annonce de chelem : faire TOUS les plis. +400 si réussi, −200 si raté.',
    difficulty: 5, winRate: '~10%', duration: '~1h30', cards: 78, available: true,
    options: { players: 4, contract: 'free', chelem: 'announced', multi: true },
    rules: [
      { title: 'Annonce ultime', body: 'Le preneur déclare qu\'il fera les 18 plis (à 4 joueurs).' },
      { title: 'Bonus', body: '+400 points si réussi, +200 si non annoncé mais réalisé (Petit Chelem).' },
      { title: 'Pénalité', body: '−200 points si annoncé et raté.' },
    ],
  },
  {
    key: 'vs-ai', engine: 'vs-ai', emoji: '🤖', name: 'Solo vs IA',
    shortDesc: 'Solo contre 3 IA, mode entraînement.',
    difficulty: 4, winRate: '~30%', duration: '~1h', cards: 78, available: true,
    options: { players: 4, contract: 'free' },
    rules: [
      { title: 'Mode', body: 'Solo : tu joues contre 3 IA (en preneur ou défenseur selon les enchères).' },
      { title: 'IA', body: 'Suit règles strictes : fournir, monter à l\'atout, signal partenaire.' },
      { title: 'Hors-ligne', body: 'Pas de socket, idéal pour s\'entraîner.' },
    ],
  },
];

export const AVAILABLE_VARIANTS = VARIANTS.filter((v) => v.available);
export function findVariant(key: string): Variant | undefined {
  return VARIANTS.find((v) => v.key === key);
}
