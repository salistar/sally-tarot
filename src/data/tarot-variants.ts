/**
 * @file tarot-variants.ts
 * @description Catalogue des grandes variantes officielles du Tarot français
 * + variantes italiennes. Chaque variante définit nb joueurs, deck size,
 * structure des contrats, bouts et i18n FR / EN / AR / ES / Darija.
 *
 * Sources : FFT (Fédération Française de Tarot), Wikipedia (FR/EN/IT),
 * Académie des Jeux Hubert.
 */

export type Lang = 'fr' | 'en' | 'ar' | 'es' | 'darija';
export type VariantId =
  | 'francais-4j'      // Tarot français classique 4 joueurs (le plus joué FR)
  | 'francais-5j'      // Tarot 5 joueurs avec roi appelé
  | 'francais-3j'      // Tarot 3 joueurs (chacun pour soi)
  | 'francais-6j'      // Tarot 6 joueurs (avec partenaire)
  | 'tarocchi-italien' // Tarocchi (Italie) — 78 cartes Tarot de Marseille
  | 'tarot-bridge'     // Tarot bridgé (contrats type bridge)
  | 'tarot-solo';      // Tarot solo (1v3 sans appel de roi)

export interface VariantTexts {
  name:     Record<Lang, string>;
  tagline:  Record<Lang, string>;
  overview: Record<Lang, string>;
  bidding:  Record<Lang, string>;
  scoring:  Record<Lang, string>;
  bonuses:  Record<Lang, string>;
  endgame:  Record<Lang, string>;
}

export interface Variant {
  id:           VariantId;
  emoji:        string;
  players:      number[];
  deckSize:     78;          // Tarot toujours 78 cartes
  target:       number;       // points cible partie complète
  hasNamed:     boolean;      // contrats nommés (Petite/Garde/...)
  hasChelem:    boolean;      // chelem possible
  hasOudlers:   boolean;      // les 3 oudlers (Petit/21/Excuse) cessent
  petitAuBout:  number;       // bonus dernier pli avec le Petit
  i18n:         VariantTexts;
}

// ─────────────────────────────────────────────────────────────────────────
// 1) Tarot français 4 joueurs (le plus joué en France)
// ─────────────────────────────────────────────────────────────────────────
const FRANCAIS_4: Variant = {
  id: 'francais-4j',
  emoji: '♛',
  players: [4],
  deckSize: 78,
  target: 0, // pas de cible — on joue à la donne
  hasNamed: true,
  hasChelem: true,
  hasOudlers: true,
  petitAuBout: 10,
  i18n: {
    name: {
      fr: 'Tarot Français 4j', en: 'French Tarot 4-p', ar: 'تاروت فرنسي ٤',
      es: 'Tarot Francés 4j', darija: 'التاروت بـ4',
    },
    tagline: {
      fr: '4 joueurs · 78 cartes · contrats Petite→Garde-contre · Bouts',
      en: '4 players · 78 cards · Petite→Garde-contre contracts · Oudlers',
      ar: '٤ لاعبين · ٧٨ ورقة · عقود متدرجة',
      es: '4 jugadores · 78 cartas · contratos · Oudlers',
      darija: '4 لاعبين · 78 ورقة · عقود',
    },
    overview: {
      fr: "Le Tarot français se joue à 4 avec un jeu de 78 cartes (4 couleurs de 14 cartes + 21 atouts numérotés + l'Excuse). Le donneur distribue 18 cartes par joueur (paquets de 3) et constitue un chien de 6 cartes au sol. Le preneur joue seul contre les 3 autres. Le but est de faire suffisamment de points selon les Bouts (1, 21, Excuse) qu'on possède : 36 points avec 0 bout, 41 avec 1 bout, 51 avec 2 bouts, 56 avec 3 bouts.",
      en: 'French Tarot is played by 4 with a 78-card deck (4 suits of 14 cards + 21 trumps + the Excuse). The dealer gives each player 18 cards (in packets of 3) and forms a 6-card chien on the table. The taker plays alone against the other 3. Goal: score enough based on Oudlers (1, 21, Excuse) held: 36 pts with 0 oudler, 41 with 1, 51 with 2, 56 with 3.',
      ar: 'يُلعب التاروت الفرنسي بأربعة لاعبين بمجموعة من ٧٨ ورقة. يوزع الموزع ١٨ ورقة لكل لاعب ويضع ٦ أوراق في الكنز. الآخذ يلعب وحده ضد الثلاثة. الهدف: تحقيق نقاط حسب عدد الأبطال (Bouts): ١ و٢١ والـExcuse.',
      es: 'El Tarot francés se juega entre 4 con baraja de 78 cartas. El repartidor da 18 cartas a cada jugador (en paquetes de 3) y forma un chien de 6 cartas sobre la mesa. El tomador juega solo contra los otros 3.',
      darija: 'التاروت الفرنسي كيتلعب 4 لاعبين بـ78 ورقة. كل لاعب كياخد 18 ورقة. الآخذ كيلعب وحدو ضد التلاتة.',
    },
    bidding: {
      fr: "5 contrats par enchère croissante : Passe (rien), Petite (= prend, chien retourné), Garde (idem mais points x2), Garde Sans (chien gardé caché, x4), Garde Contre (chien retourné gardé, x6). Le plus haut contrat l'emporte. Le preneur peut annoncer un Chelem (faire toutes les levées) avant le 1er pli pour bonus.",
      en: '5 escalating bids: Pass, Petite (take, chien revealed), Garde (same, x2), Garde Sans (chien hidden, x4), Garde Contre (chien revealed kept, x6). Highest contract wins. Taker may announce Chelem (win all tricks) before first trick for bonus.',
      ar: '٥ مزايدات متصاعدة: مرر، صغير، حارس، حارس بدون، حارس ضد. أعلى عقد يفوز. يمكن إعلان الشيلام قبل اليد الأولى.',
      es: '5 contratos crecientes: Pasa, Pequeña, Guardia, Guardia Sin, Guardia Contra. El contrato más alto gana.',
      darija: '5 عقود متدرجة: باسي، بوتيت، گارد، گارد سان، گارد كونتر. أعلى عقد كيربح.',
    },
    scoring: {
      fr: "Valeur des cartes : Roi=5, Dame=4, Cavalier=3, Valet=2, autres=0. Les 3 Bouts (1 d'atout=Petit, 21=Monde, Excuse) valent 4.5 chacun. Total 91 points dans le deck. Le preneur additionne ses plis + chien (sauf Garde Sans/Contre) et compare aux Bouts détenus pour réussir le contrat.",
      en: 'Card values: King=5, Queen=4, Knight=3, Jack=2, others=0. The 3 Oudlers (Petit=1 of trump, Monde=21, Excuse) each worth 4.5. Total 91 in the deck. Taker sums tricks + chien (except Garde Sans/Contre) and compares to Oudlers held.',
      ar: 'القيم: الملك=٥، الملكة=٤، الفارس=٣، الولد=٢. الأبطال الثلاثة بـ٤.٥ كل واحد. المجموع ٩١.',
      es: 'Valores: Rey=5, Dama=4, Caballero=3, Sota=2, otras=0. Los 3 Oudlers valen 4.5 cada uno. Total 91.',
      darija: 'القيم: الملك 5، الملكة 4، الفارس 3، الولد 2. الـ3 بوت 4.5 كل واحد. المجموع 91.',
    },
    bonuses: {
      fr: 'Petit au bout (gagner le dernier pli avec le 1 d\'atout) = +10. Chelem annoncé tenu = +400. Chelem non annoncé tenu = +200. Poignée annoncée (10 atouts en main) = +20/30/40 selon taille.',
      en: 'Petit au bout (winning last trick with Petit) = +10. Announced Chelem made = +400. Unannounced Chelem made = +200. Handful announced (10 trumps in hand) = +20/30/40.',
      ar: 'الصغير في النهاية = +١٠. الشيلام المُعلن = +٤٠٠. الشيلام غير المُعلن = +٢٠٠.',
      es: 'Petit al final = +10. Chelem anunciado cumplido = +400. No anunciado = +200.',
      darija: 'الصغير فلخر = +10. الشلام المعلن = +400. غير المعلن = +200.',
    },
    endgame: {
      fr: 'Score = (points faits - cible) × multiplicateur du contrat + bonus. Le preneur encaisse 3× ce montant (un par défenseur). Une partie peut être un match en plusieurs donnes — premier à un score cumulé positif gagne, ou se joue à la donne.',
      en: 'Score = (points made - target) × contract multiplier + bonuses. Taker gets 3× that (one from each defender). Match can be best-of-N hands; first to positive cumulative wins, or single-hand only.',
      ar: 'النتيجة = (النقاط - الهدف) × مضاعف العقد + المكافآت. الآخذ يحصل على ٣ أضعاف.',
      es: 'Puntuación = (puntos - objetivo) × multiplicador del contrato + bonos. El tomador recibe 3×.',
      darija: 'النتيجة = (النقط - الهدف) × المضاعف + البونوسات. الآخذ كياخد 3 ديال هاد المبلغ.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 2) Tarot français 5 joueurs (avec roi appelé)
// ─────────────────────────────────────────────────────────────────────────
const FRANCAIS_5: Variant = {
  id: 'francais-5j',
  emoji: '🤝',
  players: [5],
  deckSize: 78,
  target: 0,
  hasNamed: true,
  hasChelem: true,
  hasOudlers: true,
  petitAuBout: 10,
  i18n: {
    name: {
      fr: 'Tarot Français 5j', en: 'French Tarot 5-p', ar: 'تاروت ٥ لاعبين',
      es: 'Tarot Francés 5j', darija: 'تاروت 5',
    },
    tagline: {
      fr: '5 joueurs · roi appelé · partenaire secret',
      en: '5 players · called King · secret partner',
      ar: '٥ لاعبين · ملك مستدعى',
      es: '5 jugadores · rey llamado · pareja secreta',
      darija: '5 لاعبين · ملك مدعي',
    },
    overview: {
      fr: "À 5 avec 78 cartes (15 cartes par joueur + 3 au chien). Le preneur, après son contrat, appelle un Roi (celui qu'il n'a pas) — le détenteur devient son partenaire secret jusqu'au moment où ce Roi est joué.",
      en: 'With 5 players and 78 cards (15 each + 3 in chien). The taker, after their bid, calls a King (one they don\'t hold) — the holder becomes their secret partner until the King is played.',
      ar: '٥ لاعبين بـ٧٨ ورقة (١٥ لكل واحد + ٣ في الكنز). الآخذ يستدعي ملكاً يصبح صاحبه شريكاً سرياً.',
      es: '5 jugadores y 78 cartas (15 c/u + 3 en chien). El tomador llama a un Rey y su poseedor se vuelve pareja secreta.',
      darija: '5 لاعبين بـ78 ورقة. الآخذ كيدعي ملك واللي عندو كيولي شريك سري.',
    },
    bidding: FRANCAIS_4.i18n.bidding,
    scoring: FRANCAIS_4.i18n.scoring,
    bonuses: FRANCAIS_4.i18n.bonuses,
    endgame: {
      fr: 'Le preneur + son partenaire vs les 3 autres. Le preneur encaisse 2× le score (1 du partenaire, 1 des défenseurs). Si le Roi appelé est dans le chien, le preneur joue seul vs 4.',
      en: 'Taker + partner vs the 3 others. Taker scores 2× (from partner + defenders combined). If the called King is in the chien, taker plays alone vs 4.',
      ar: 'الآخذ مع الشريك ضد الثلاثة. الآخذ يحصل على ضعف النقاط.',
      es: 'Tomador + pareja vs los 3 restantes. El tomador anota 2× el score.',
      darija: 'الآخذ مع الشريك ضد التلاتة لخرين.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 3) Tarot 3 joueurs (chacun pour soi)
// ─────────────────────────────────────────────────────────────────────────
const FRANCAIS_3: Variant = {
  id: 'francais-3j',
  emoji: '⚔️',
  players: [3],
  deckSize: 78,
  target: 0,
  hasNamed: true,
  hasChelem: true,
  hasOudlers: true,
  petitAuBout: 10,
  i18n: {
    name: {
      fr: 'Tarot 3 joueurs', en: 'Tarot 3-player', ar: 'تاروت ٣',
      es: 'Tarot 3 jugadores', darija: 'تاروت 3',
    },
    tagline: {
      fr: '3 joueurs · chacun pour soi · 24 cartes',
      en: '3 players · each for themselves · 24 cards',
      ar: '٣ لاعبين · كل واحد لوحده',
      es: '3 jugadores · cada uno solo',
      darija: '3 لاعبين · كل واحد بوحدو',
    },
    overview: {
      fr: 'À 3 avec 78 cartes : 24 cartes par joueur + 6 au chien. Le preneur joue contre les deux autres mais le score se divise par 2 entre eux (les défenseurs partagent gain/perte).',
      en: 'With 3 players and 78 cards: 24 each + 6 in chien. Taker plays alone against the other 2 but the score splits between them.',
      ar: '٣ لاعبين بـ٧٨ ورقة: ٢٤ لكل واحد + ٦ في الكنز.',
      es: '3 jugadores y 78 cartas: 24 c/u + 6 en chien.',
      darija: '3 لاعبين، 24 ورقة لكل واحد و6 فالكنز.',
    },
    bidding: FRANCAIS_4.i18n.bidding,
    scoring: FRANCAIS_4.i18n.scoring,
    bonuses: FRANCAIS_4.i18n.bonuses,
    endgame: FRANCAIS_4.i18n.endgame,
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 4) Tarot 6 joueurs (rare)
// ─────────────────────────────────────────────────────────────────────────
const FRANCAIS_6: Variant = {
  id: 'francais-6j',
  emoji: '👥',
  players: [6],
  deckSize: 78,
  target: 0,
  hasNamed: true,
  hasChelem: true,
  hasOudlers: true,
  petitAuBout: 10,
  i18n: {
    name: {
      fr: 'Tarot 6 joueurs', en: 'Tarot 6-player', ar: 'تاروت ٦',
      es: 'Tarot 6 jugadores', darija: 'تاروت 6',
    },
    tagline: {
      fr: '6 joueurs · 2 partenaires appelés · 12 cartes/main',
      en: '6 players · 2 called partners · 12 cards/hand',
      ar: '٦ لاعبين · شريكان مستدعيان',
      es: '6 jugadores · 2 parejas llamadas',
      darija: '6 لاعبين · 2 شركاء',
    },
    overview: {
      fr: 'À 6 (rare) : 78 cartes en 12 par joueur + 6 chien. Le preneur appelle 2 partenaires (un par Roi) pour former une équipe à 3 contre les 3 autres.',
      en: '6 players (rare): 78 cards = 12 each + 6 chien. Taker calls 2 partners (one per King) forming a 3-vs-3 team.',
      ar: '٦ لاعبين (نادر): ١٢ ورقة لكل واحد + ٦ في الكنز. يستدعي شريكين.',
      es: '6 jugadores (raro): 12 c/u + 6 chien. Se llaman 2 parejas.',
      darija: '6 لاعبين، 12 ورقة لكل واحد. الآخذ كيدعي 2 شركاء.',
    },
    bidding: FRANCAIS_4.i18n.bidding,
    scoring: FRANCAIS_4.i18n.scoring,
    bonuses: FRANCAIS_4.i18n.bonuses,
    endgame: FRANCAIS_4.i18n.endgame,
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 5) Tarocchi italien
// ─────────────────────────────────────────────────────────────────────────
const TAROCCHI: Variant = {
  id: 'tarocchi-italien',
  emoji: '🇮🇹',
  players: [3, 4],
  deckSize: 78,
  target: 0,
  hasNamed: false,
  hasChelem: false,
  hasOudlers: true,
  petitAuBout: 0,
  i18n: {
    name: {
      fr: 'Tarocchi italien', en: 'Italian Tarocchi', ar: 'تاروكي إيطالي',
      es: 'Tarocchi italiano', darija: 'تاروكي إيطالي',
    },
    tagline: {
      fr: 'Tarot de Marseille · règles régionales',
      en: 'Marseille Tarot · regional rules',
      ar: 'تاروت مرسيليا · قواعد محلية',
      es: 'Tarot de Marsella · reglas regionales',
      darija: 'تاروت مرسيليا',
    },
    overview: {
      fr: 'Joué en Italie du Nord avec un Tarot de Marseille à 78 cartes. Plus simple que le tarot français — pas de contrats numérotés mais des règles régionales (Tarocchino bolognese, Minchiate florentin, Tarocchi piemontesi). Mood plus convivial que compétition.',
      en: 'Played in Northern Italy with the 78-card Marseille Tarot. Simpler than French — no numbered contracts but regional rules (Tarocchino, Minchiate, Tarocchi piemontesi). Convivial atmosphere.',
      ar: 'يُلعب في شمال إيطاليا بـ٧٨ ورقة. أبسط من الفرنسي — بدون عقود رقمية.',
      es: 'Jugado en el norte de Italia con Tarot de Marsella de 78 cartas. Más simple, sin contratos numerados.',
      darija: 'كيتلعب فإيطاليا بـ78 ورقة. أبسط من الفرنسي.',
    },
    bidding: {
      fr: 'Pas de contrats formels — chacun joue pour faire le plus de points. Le mort (chien) est révélé et toutes les cartes vont aux plis. Le donneur change à chaque manche.',
      en: 'No formal contracts — everyone plays to score most points. The dead hand (chien) is revealed; all cards go into tricks. Dealer rotates each hand.',
      ar: 'بدون عقود رسمية — كل واحد يلعب لتحقيق أكبر عدد من النقاط.',
      es: 'Sin contratos formales — cada uno juega para sumar más puntos.',
      darija: 'بلا عقود — كل واحد كيلعب باش يجمع أكثر نقاط.',
    },
    scoring: {
      fr: 'Comme français : Roi=5, Reine=4, Cavalier=3, Valet=2. Oudlers (1, 21, Matto/Excuse) = 4.5 chacun. Carte simple = 0.5. Total 91.',
      en: 'Like French: King=5, Queen=4, Knight=3, Jack=2. Oudlers (1, 21, Matto/Excuse) = 4.5 each. Simple = 0.5. Total 91.',
      ar: 'كالفرنسي: الملك=٥، الملكة=٤، الفارس=٣، الولد=٢. الأبطال=٤.٥ كل واحد.',
      es: 'Como francés. King=5, Queen=4, Knight=3, Jack=2. Oudlers = 4.5 c/u.',
      darija: 'بحال الفرنسي. الملك 5، الملكة 4، الفارس 3، الولد 2.',
    },
    bonuses: {
      fr: 'Variantes régionales : Tarocchino prévoit des Versicole (combinaisons) qui valent des points bonus comme à la Manille.',
      en: 'Regional variants: Tarocchino has Versicole (combinations) granting bonus points like in Manille.',
      ar: 'الإصدارات المحلية لها مكافآت تركيبات.',
      es: 'Variantes regionales tienen Versicole (combinaciones) con puntos extra.',
      darija: 'الإصدارات المحلية فيها بونوسات للتركيبات.',
    },
    endgame: {
      fr: 'Le joueur ayant le plus de points gagne la donne. Match en plusieurs donnes selon entente.',
      en: 'Player with most points wins the hand. Multi-hand match by agreement.',
      ar: 'الذي يجمع أكثر النقاط يفوز.',
      es: 'El jugador con más puntos gana la mano.',
      darija: 'اللي عندو أكثر نقاط كيربح.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 6) Tarot bridgé
// ─────────────────────────────────────────────────────────────────────────
const BRIDGE: Variant = {
  ...FRANCAIS_4,
  id: 'tarot-bridge',
  emoji: '🌉',
  i18n: {
    ...FRANCAIS_4.i18n,
    name: {
      fr: 'Tarot bridgé', en: 'Bridged Tarot', ar: 'تاروت الجسر',
      es: 'Tarot Puente', darija: 'تاروت مجسر',
    },
    tagline: {
      fr: 'Contrats nommés à la bridge · esprit stratégique',
      en: 'Bridge-style named contracts · strategic',
      ar: 'عقود مسماة بأسلوب البريدج',
      es: 'Contratos nombrados estilo bridge',
      darija: 'عقود مسمية كالبريدج',
    },
    overview: {
      fr: 'Variante française moderne : on emprunte au bridge la nomenclature des contrats (Petite, Garde, Grand Chelem, Petit Chelem, Sans Atout). Le décompte des points et les Oudlers restent identiques au tarot classique mais l\'esprit est plus compétitif.',
      en: 'Modern French variant: borrows bridge contract names (Petite, Garde, Grand Slam, Small Slam, No-Trump). Same scoring/Oudlers as classic, more competitive feel.',
      ar: 'نسخة فرنسية حديثة تستعير من البريدج تسمية العقود.',
      es: 'Variante francesa moderna que toma del bridge la nomenclatura.',
      darija: 'نسخة فرنسية حديثة كتستعير من البريدج الأسماء.',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────
// 7) Tarot solo (1v3 sans appel)
// ─────────────────────────────────────────────────────────────────────────
const SOLO: Variant = {
  ...FRANCAIS_4,
  id: 'tarot-solo',
  emoji: '🎯',
  players: [4],
  i18n: {
    ...FRANCAIS_4.i18n,
    name: {
      fr: 'Tarot Solo', en: 'Tarot Solo', ar: 'تاروت سولو',
      es: 'Tarot Solo', darija: 'تاروت سولو',
    },
    tagline: {
      fr: '1 preneur vs 3 défenseurs · pas d\'appel · pur skill',
      en: '1 taker vs 3 defenders · no call · pure skill',
      ar: 'آخذ ضد ٣ مدافعين · بدون استدعاء',
      es: '1 tomador vs 3 defensores · sin llamada',
      darija: 'آخذ واحد ضد 3 · بلا استدعاء',
    },
    overview: {
      fr: 'Variante stricte : le preneur ne peut pas appeler de roi (donc joue seul). Plus rude que le classique mais récompense les bonnes mains. Score x2 par rapport au classique.',
      en: 'Strict variant: taker cannot call a King (plays alone). Harsher than classic but rewards strong hands. Score x2 vs classic.',
      ar: 'نسخة صارمة: الآخذ لا يستطيع استدعاء ملك. النقاط مضاعفة.',
      es: 'Variante estricta: el tomador no puede llamar un Rey. Score x2.',
      darija: 'نسخة صارمة بلا استدعاء. النقط مضاعفة.',
    },
  },
};

export const VARIANTS: Variant[] = [
  FRANCAIS_4, FRANCAIS_5, FRANCAIS_3, FRANCAIS_6, TAROCCHI, BRIDGE, SOLO,
];

export function getVariant(id: VariantId): Variant {
  return VARIANTS.find(v => v.id === id) || FRANCAIS_4;
}

export function variantsForPlayerCount(n: number): Variant[] {
  return VARIANTS.filter(v => v.players.includes(n));
}
