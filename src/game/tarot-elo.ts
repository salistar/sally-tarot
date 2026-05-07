/**
 * @file tarot-elo.ts
 * @description Système ELO Tarot basé sur les contrats réalisés.
 * Bonus pour Garde Contre, Chelem, Petit au bout.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_ELO = 1000;
const REPLAY_PREFIX = 'replay:tarot:';

const VARIANTS = ['classic4p', 'classic3p', 'classic5p', 'scientifico'];

const CONTRACT_GAIN: Record<string, number> = {
  petite: 10,
  garde: 20,
  gardeSans: 30,
  gardeContre: 50,
};

interface TarotWin {
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

export interface VariantElo {
  variant: string;
  elo: number;
  wins: number;
  history: { date: number; elo: number; gain: number; reason: string }[];
}

async function listAllResults(): Promise<TarotWin[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const replayKeys = keys.filter((k) => k.startsWith(REPLAY_PREFIX));
    const items = await AsyncStorage.multiGet(replayKeys);
    return items
      .map(([_, v]) => { try { return JSON.parse(v ?? ''); } catch { return null; } })
      .filter((x): x is TarotWin => !!x && typeof x.score === 'number');
  } catch {
    return [];
  }
}

export async function computeEloByVariant(): Promise<Record<string, VariantElo>> {
  const results = await listAllResults();
  results.sort((a, b) => a.wonAt - b.wonAt);
  const out: Record<string, VariantElo> = {};
  for (const v of VARIANTS) out[v] = { variant: v, elo: BASE_ELO, wins: 0, history: [] };

  for (const r of results) {
    const v = out[r.variantKey];
    if (!v) continue;
    if (!r.won) {
      // Contrat chuté : malus selon contrat
      const malus = (CONTRACT_GAIN[r.contract] ?? 10);
      v.elo -= malus;
      v.history.push({ date: r.wonAt, elo: v.elo, gain: -malus, reason: `Chute ${r.contract}` });
      continue;
    }
    let gain = CONTRACT_GAIN[r.contract] ?? 10;
    let reason = `Win ${r.contract}`;
    if (r.chelemAnnounced) { gain += 50; reason += ' +chelem'; }
    if (r.petitAuBout) { gain += 10; reason += ' +petitAuBout'; }
    if (r.boutsCaptured === 3) { gain += 10; reason += ' +3bouts'; }
    v.elo += gain;
    v.wins++;
    v.history.push({ date: r.wonAt, elo: v.elo, gain, reason });
  }
  return out;
}

export async function computeGlobalElo(): Promise<number> {
  const eloMap = await computeEloByVariant();
  const played = Object.values(eloMap).filter((v) => v.wins > 0);
  if (played.length === 0) return BASE_ELO;
  return Math.round(played.reduce((a, b) => a + b.elo, 0) / played.length);
}

export function rankFromElo(elo: number): { tier: string; color: string; emoji: string } {
  if (elo >= 2500) return { tier: 'Diamond', color: '#06B6D4', emoji: '💎' };
  if (elo >= 2000) return { tier: 'Platinum', color: '#A855F7', emoji: '🏆' };
  if (elo >= 1500) return { tier: 'Gold', color: '#F59E0B', emoji: '🥇' };
  if (elo >= 1200) return { tier: 'Silver', color: '#94A3B8', emoji: '🥈' };
  return { tier: 'Bronze', color: '#92400E', emoji: '🥉' };
}
