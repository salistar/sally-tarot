/**
 * @file achievements.ts
 * @description Achievements Tarot.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'achievements:unlocked';
const REPLAY_PREFIX = 'replay:tarot:';

export interface TarotResult {
  id: string;
  variantKey: string;
  contract: string;
  score: number;
  boutsCaptured: number;
  chelemAnnounced: boolean;
  petitAuBout: boolean;
  durationMs: number;
  wonAt: number;
  won: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  check: (results: TarotResult[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-petite', title: 'Première Petite', description: 'Réussir une Petite.', icon: 'trophy', rarity: 'common', check: (rs) => rs.some((r) => r.contract === 'petite' && r.won) },
  { id: 'first-garde', title: 'Première Garde', description: 'Réussir une Garde.', icon: 'shield', rarity: 'common', check: (rs) => rs.some((r) => r.contract === 'garde' && r.won) },
  { id: 'first-garde-sans', title: 'Garde sans le chien', description: 'Réussir une Garde sans le chien.', icon: 'eye-off', rarity: 'rare', check: (rs) => rs.some((r) => r.contract === 'gardeSans' && r.won) },
  { id: 'first-garde-contre', title: 'Garde contre', description: 'Réussir une Garde contre le chien.', icon: 'flame', rarity: 'epic', check: (rs) => rs.some((r) => r.contract === 'gardeContre' && r.won) },
  { id: 'three-bouts', title: 'Trois bouts', description: 'Capture les 3 bouts dans une donne.', icon: 'star', rarity: 'rare', check: (rs) => rs.some((r) => r.boutsCaptured === 3) },
  { id: 'petit-au-bout', title: 'Petit au bout', description: 'Petit au bout réussi.', icon: 'sparkles', rarity: 'rare', check: (rs) => rs.some((r) => r.petitAuBout && r.won) },
  { id: 'chelem', title: 'Chelem !', description: 'Chelem annoncé et réalisé.', icon: 'flash', rarity: 'legendary', check: (rs) => rs.some((r) => r.chelemAnnounced && r.won) },
  { id: 'win-25', title: 'Vétéran FFT', description: 'Gagne 25 contrats.', icon: 'medal', rarity: 'rare', check: (rs) => rs.filter((r) => r.won).length >= 25 },
];

export interface UnlockedAchievement extends Achievement { unlockedAt: number; }

async function listAllResults(): Promise<TarotResult[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const replayKeys = keys.filter((k) => k.startsWith(REPLAY_PREFIX));
    const items = await AsyncStorage.multiGet(replayKeys);
    return items
      .map(([_, v]) => { try { return JSON.parse(v ?? ''); } catch { return null; } })
      .filter((x): x is TarotResult => !!x && typeof x.score === 'number');
  } catch {
    return [];
  }
}

export async function evaluateAchievements(): Promise<{ all: Achievement[]; unlocked: Record<string, number>; newlyUnlocked: Achievement[] }> {
  const results = await listAllResults();
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const unlocked: Record<string, number> = raw ? JSON.parse(raw) : {};
  const newlyUnlocked: Achievement[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (unlocked[ach.id]) continue;
    if (ach.check(results)) { unlocked[ach.id] = Date.now(); newlyUnlocked.push(ach); }
  }
  if (newlyUnlocked.length > 0) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  return { all: ACHIEVEMENTS, unlocked, newlyUnlocked };
}

export async function getUnlockedAchievements(): Promise<Record<string, number>> {
  try { const raw = await AsyncStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
