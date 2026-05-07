/**
 * TarotEngine - Simplified trick-taking game for 4 players
 * Uses Spanish 40-card deck: 4 suits x 10 values (1-7, 10-12)
 *
 * Rules:
 * - Deal 10 cards each (40 total)
 * - Bidding: one player becomes "preneur" (taker) who plays alone vs 3 defenders
 * - If no one bids, redeal
 * - Trump suit decided by highest bidder
 * - Play tricks: must follow suit, trump beats non-trump
 * - Preneur needs to win at least 6 of 10 tricks
 * - Scoring: preneur wins = +3 points each defender, loses = -3 each
 */

// ============================================================
// TYPES
// ============================================================

export type Suit = 'bastos' | 'copas' | 'espadas' | 'oros';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

export interface Card {
  suit: Suit;
  value: CardValue;
  id: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  tricksWon: number;
  isBot: boolean;
  hasPassed: boolean;
  bid: Suit | null; // The suit they bid as trump
}

export type GamePhase =
  | 'waiting'
  | 'dealing'
  | 'bidding'
  | 'playing'
  | 'trick_end'
  | 'scoring'
  | 'game_over';

export interface Trick {
  cards: { playerId: string; card: Card }[];
  leadSuit: Suit | null;
  winnerId: string | null;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  deck: Card[];
  trumpSuit: Suit | null;
  preneurIndex: number; // Index of the taker
  currentPlayerIndex: number;
  currentTrick: Trick;
  tricksPlayed: number;
  roundNumber: number;
  targetScore: number;
  dealerIndex: number;
  lastAction: string;
  winnerId: string | null;
  biddingRound: number; // Track how many players have had a chance to bid
}

export type GameAction =
  | { type: 'JOIN'; playerId: string; playerName: string; isBot?: boolean }
  | { type: 'START_GAME' }
  | { type: 'BID'; playerId: string; suit: Suit }
  | { type: 'PASS'; playerId: string }
  | { type: 'PLAY_CARD'; playerId: string; cardId: string }
  | { type: 'NEXT_TRICK' }
  | { type: 'NEW_ROUND' }
  | { type: 'RESET' };

// ============================================================
// CONSTANTS
// ============================================================

export const SUITS: Suit[] = ['bastos', 'copas', 'espadas', 'oros'];
export const VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
export const NUM_PLAYERS = 4;
export const CARDS_PER_PLAYER = 10;
export const TRICKS_TO_WIN = 6;
export const POINTS_PER_ROUND = 3;
export const DEFAULT_TARGET_SCORE = 21;

// Card strength for trick comparison (higher = stronger)
const CARD_STRENGTH: Record<CardValue, number> = {
  1: 10, // Ace is strongest
  12: 9,
  11: 8,
  10: 7,
  7: 6,
  6: 5,
  5: 4,
  4: 3,
  3: 2,
  2: 1,
};

export const SUIT_NAMES: Record<Suit, string> = {
  bastos: 'Clubs',
  copas: 'Cups',
  espadas: 'Swords',
  oros: 'Coins',
};

export const VALUE_NAMES: Record<CardValue, string> = {
  1: 'As', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  10: 'Sota', 11: 'Caballo', 12: 'Rey',
};

// ============================================================
// DECK
// ============================================================

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      const valueStr = value.toString().padStart(2, '0');
      deck.push({ suit, value, id: `${valueStr}-${suit}` });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================
// CARD LOGIC
// ============================================================

function getCardStrength(card: Card): number {
  return CARD_STRENGTH[card.value];
}

/** Get playable cards: must follow suit if possible, otherwise can play anything */
export function getPlayableCards(hand: Card[], leadSuit: Suit | null): Card[] {
  if (!leadSuit) return hand; // First to play, any card
  const suitCards = hand.filter((c) => c.suit === leadSuit);
  return suitCards.length > 0 ? suitCards : hand;
}

/** Determine trick winner */
function determineTrickWinner(
  trick: Trick,
  trumpSuit: Suit | null
): string {
  if (trick.cards.length === 0) return '';

  let winnerId = trick.cards[0].playerId;
  let winningCard = trick.cards[0].card;

  for (let i = 1; i < trick.cards.length; i++) {
    const { card, playerId } = trick.cards[i];

    const currentIsTrump = card.suit === trumpSuit;
    const winnerIsTrump = winningCard.suit === trumpSuit;

    if (currentIsTrump && !winnerIsTrump) {
      // Trump beats non-trump
      winnerId = playerId;
      winningCard = card;
    } else if (currentIsTrump && winnerIsTrump) {
      // Both trump: higher strength wins
      if (getCardStrength(card) > getCardStrength(winningCard)) {
        winnerId = playerId;
        winningCard = card;
      }
    } else if (!currentIsTrump && !winnerIsTrump) {
      // Neither trump: must follow lead suit
      if (card.suit === trick.leadSuit && winningCard.suit !== trick.leadSuit) {
        winnerId = playerId;
        winningCard = card;
      } else if (
        card.suit === winningCard.suit &&
        getCardStrength(card) > getCardStrength(winningCard)
      ) {
        winnerId = playerId;
        winningCard = card;
      }
    }
    // Non-trump doesn't beat trump
  }

  return winnerId;
}

// ============================================================
// BOT AI
// ============================================================

export function botPlay(state: GameState): GameAction | null {
  const player = state.players[state.currentPlayerIndex];
  if (!player || !player.isBot) return null;

  if (state.phase === 'bidding') {
    return botBid(player, state);
  }

  if (state.phase === 'playing') {
    return botPlayCard(player, state);
  }

  return null;
}

function botBid(player: Player, state: GameState): GameAction {
  // Count cards per suit to decide if we should bid
  const suitCounts = new Map<Suit, number>();
  const suitStrength = new Map<Suit, number>();

  for (const suit of SUITS) {
    const cards = player.hand.filter((c) => c.suit === suit);
    suitCounts.set(suit, cards.length);
    suitStrength.set(
      suit,
      cards.reduce((sum, c) => sum + getCardStrength(c), 0)
    );
  }

  // Find strongest suit
  let bestSuit: Suit = 'bastos';
  let bestScore = 0;
  for (const [suit, count] of suitCounts) {
    const score = count * 5 + (suitStrength.get(suit) || 0);
    if (score > bestScore) {
      bestScore = score;
      bestSuit = suit;
    }
  }

  // Bid if we have a strong enough suit (at least 4 cards or high strength)
  const bestCount = suitCounts.get(bestSuit) || 0;
  if (bestCount >= 4 || bestScore >= 30) {
    return { type: 'BID', playerId: player.id, suit: bestSuit };
  }

  return { type: 'PASS', playerId: player.id };
}

function botPlayCard(player: Player, state: GameState): GameAction {
  const playable = getPlayableCards(player.hand, state.currentTrick.leadSuit);

  if (playable.length === 0) {
    // Should not happen, but safety
    return { type: 'PLAY_CARD', playerId: player.id, cardId: player.hand[0].id };
  }

  const isPreneur = state.players.indexOf(player) === state.preneurIndex;

  // Sort by strength
  const sorted = [...playable].sort(
    (a, b) => getCardStrength(b) - getCardStrength(a)
  );

  if (state.currentTrick.cards.length === 0) {
    // Leading: play trump if preneur, otherwise play weakest
    if (isPreneur && state.trumpSuit) {
      const trumpCards = sorted.filter((c) => c.suit === state.trumpSuit);
      if (trumpCards.length > 0) {
        return { type: 'PLAY_CARD', playerId: player.id, cardId: trumpCards[0].id };
      }
    }
    // Play strongest card
    return { type: 'PLAY_CARD', playerId: player.id, cardId: sorted[0].id };
  }

  // Following: play highest to try to win, or lowest if can't win
  const currentWinnerId = determineTrickWinner(state.currentTrick, state.trumpSuit);
  const currentWinner = state.players.find((p) => p.id === currentWinnerId);
  const isPartner =
    currentWinner &&
    state.players.indexOf(currentWinner) !== state.preneurIndex &&
    !isPreneur;

  if (isPartner) {
    // Partner is winning, play lowest
    return { type: 'PLAY_CARD', playerId: player.id, cardId: sorted[sorted.length - 1].id };
  }

  // Try to win with highest card
  return { type: 'PLAY_CARD', playerId: player.id, cardId: sorted[0].id };
}

// ============================================================
// GAME STATE
// ============================================================

export function initGame(): GameState {
  return {
    phase: 'waiting',
    players: [],
    deck: [],
    trumpSuit: null,
    preneurIndex: -1,
    currentPlayerIndex: 0,
    currentTrick: { cards: [], leadSuit: null, winnerId: null },
    tricksPlayed: 0,
    roundNumber: 0,
    targetScore: DEFAULT_TARGET_SCORE,
    dealerIndex: 0,
    lastAction: '',
    winnerId: null,
    biddingRound: 0,
  };
}

function dealCards(state: GameState): GameState {
  const deck = shuffleDeck(createDeck());
  const players = state.players.map((p, i) => ({
    ...p,
    hand: deck.slice(i * CARDS_PER_PLAYER, (i + 1) * CARDS_PER_PLAYER),
    tricksWon: 0,
    hasPassed: false,
    bid: null as Suit | null,
  }));

  const firstBidder = (state.dealerIndex + 1) % NUM_PLAYERS;

  return {
    ...state,
    phase: 'bidding',
    players,
    deck: [],
    trumpSuit: null,
    preneurIndex: -1,
    currentPlayerIndex: firstBidder,
    currentTrick: { cards: [], leadSuit: null, winnerId: null },
    tricksPlayed: 0,
    roundNumber: state.roundNumber + 1,
    lastAction: 'Cards dealt - Bidding phase',
    biddingRound: 0,
  };
}

export function getWinner(state: GameState): { winnerId: string; description: string } | null {
  for (const p of state.players) {
    if (p.score >= state.targetScore) {
      return { winnerId: p.id, description: `${p.name} reached ${state.targetScore} points` };
    }
  }
  return null;
}

// ============================================================
// REDUCER
// ============================================================

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'JOIN': {
      if (state.phase !== 'waiting') return state;
      if (state.players.length >= NUM_PLAYERS) return state;
      if (state.players.find((p) => p.id === action.playerId)) return state;
      return {
        ...state,
        players: [
          ...state.players,
          {
            id: action.playerId,
            name: action.playerName,
            hand: [],
            score: 0,
            tricksWon: 0,
            isBot: action.isBot || false,
            hasPassed: false,
            bid: null,
          },
        ],
      };
    }

    case 'START_GAME': {
      if (state.players.length !== NUM_PLAYERS) return state;
      return dealCards(state);
    }

    case 'BID': {
      if (state.phase !== 'bidding') return state;
      const pi = state.players.findIndex((p) => p.id === action.playerId);
      if (pi !== state.currentPlayerIndex) return state;

      const updatedPlayers = [...state.players];
      updatedPlayers[pi] = { ...updatedPlayers[pi], bid: action.suit };

      // This player becomes the preneur, but others can still outbid
      const nextBidder = (pi + 1) % NUM_PLAYERS;
      const newBiddingRound = state.biddingRound + 1;

      // If all have had a chance to bid, start playing
      if (newBiddingRound >= NUM_PLAYERS) {
        // Find the last bidder (preneur)
        const lastBidderIdx = updatedPlayers.findIndex((p) => p.bid !== null);
        const preneurIdx = lastBidderIdx >= 0 ? pi : -1;
        const trump = preneurIdx >= 0 ? updatedPlayers[preneurIdx].bid : null;

        if (preneurIdx === -1 || !trump) {
          // No one bid, redeal
          return dealCards({
            ...state,
            players: updatedPlayers,
            dealerIndex: (state.dealerIndex + 1) % NUM_PLAYERS,
          });
        }

        return {
          ...state,
          phase: 'playing',
          players: updatedPlayers,
          trumpSuit: trump,
          preneurIndex: preneurIdx,
          currentPlayerIndex: (state.dealerIndex + 1) % NUM_PLAYERS,
          lastAction: `${updatedPlayers[preneurIdx].name} takes with ${SUIT_NAMES[trump]}`,
          biddingRound: newBiddingRound,
        };
      }

      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextBidder,
        preneurIndex: pi,
        trumpSuit: action.suit,
        lastAction: `${updatedPlayers[pi].name} bids ${SUIT_NAMES[action.suit]}`,
        biddingRound: newBiddingRound,
      };
    }

    case 'PASS': {
      if (state.phase !== 'bidding') return state;
      const pi = state.players.findIndex((p) => p.id === action.playerId);
      if (pi !== state.currentPlayerIndex) return state;

      const updatedPlayers = [...state.players];
      updatedPlayers[pi] = { ...updatedPlayers[pi], hasPassed: true };

      const nextBidder = (pi + 1) % NUM_PLAYERS;
      const newBiddingRound = state.biddingRound + 1;

      // If all have had a chance
      if (newBiddingRound >= NUM_PLAYERS) {
        // Check if anyone bid
        const bidders = updatedPlayers.filter((p) => p.bid !== null);
        if (bidders.length === 0) {
          // No one bid, redeal
          return dealCards({
            ...state,
            players: updatedPlayers,
            dealerIndex: (state.dealerIndex + 1) % NUM_PLAYERS,
          });
        }

        // Last bidder is preneur
        const preneurIdx = updatedPlayers.findIndex((p) => p.bid !== null);
        const trump = updatedPlayers[preneurIdx].bid!;

        return {
          ...state,
          phase: 'playing',
          players: updatedPlayers,
          trumpSuit: trump,
          preneurIndex: preneurIdx,
          currentPlayerIndex: (state.dealerIndex + 1) % NUM_PLAYERS,
          lastAction: `${updatedPlayers[preneurIdx].name} takes with ${SUIT_NAMES[trump]}`,
          biddingRound: newBiddingRound,
        };
      }

      return {
        ...state,
        players: updatedPlayers,
        currentPlayerIndex: nextBidder,
        lastAction: `${updatedPlayers[pi].name} passes`,
        biddingRound: newBiddingRound,
      };
    }

    case 'PLAY_CARD': {
      if (state.phase !== 'playing') return state;
      const pi = state.players.findIndex((p) => p.id === action.playerId);
      if (pi !== state.currentPlayerIndex) return state;

      const player = state.players[pi];
      const cardIdx = player.hand.findIndex((c) => c.id === action.cardId);
      if (cardIdx === -1) return state;

      const card = player.hand[cardIdx];

      // Validate: must follow suit if possible
      const playable = getPlayableCards(player.hand, state.currentTrick.leadSuit);
      if (!playable.find((c) => c.id === card.id)) return state;

      // Remove card from hand
      const updatedPlayers = [...state.players];
      const newHand = [...player.hand];
      newHand.splice(cardIdx, 1);
      updatedPlayers[pi] = { ...updatedPlayers[pi], hand: newHand };

      // Add to trick
      const leadSuit = state.currentTrick.cards.length === 0 ? card.suit : state.currentTrick.leadSuit;
      const newTrick: Trick = {
        cards: [...state.currentTrick.cards, { playerId: player.id, card }],
        leadSuit,
        winnerId: null,
      };

      // If trick is complete (4 cards played)
      if (newTrick.cards.length === NUM_PLAYERS) {
        const trickWinnerId = determineTrickWinner(newTrick, state.trumpSuit);
        newTrick.winnerId = trickWinnerId;

        const winnerIdx = updatedPlayers.findIndex((p) => p.id === trickWinnerId);
        updatedPlayers[winnerIdx] = {
          ...updatedPlayers[winnerIdx],
          tricksWon: updatedPlayers[winnerIdx].tricksWon + 1,
        };

        const newTricksPlayed = state.tricksPlayed + 1;
        const trickWinnerName = updatedPlayers[winnerIdx].name;

        // Check if round is over (all 10 tricks played)
        if (newTricksPlayed >= CARDS_PER_PLAYER) {
          // Scoring
          const preneur = updatedPlayers[state.preneurIndex];
          const preneurWins = preneur.tricksWon >= TRICKS_TO_WIN;

          const scoredPlayers = updatedPlayers.map((p, i) => {
            if (i === state.preneurIndex) {
              return {
                ...p,
                score: p.score + (preneurWins ? POINTS_PER_ROUND * 3 : -POINTS_PER_ROUND * 3),
              };
            }
            return {
              ...p,
              score: p.score + (preneurWins ? -POINTS_PER_ROUND : POINTS_PER_ROUND),
            };
          });

          const winner = getWinner({ ...state, players: scoredPlayers });

          return {
            ...state,
            phase: winner ? 'game_over' : 'scoring',
            players: scoredPlayers,
            currentTrick: newTrick,
            tricksPlayed: newTricksPlayed,
            lastAction: `${trickWinnerName} wins trick! ${preneurWins ? 'Preneur wins round!' : 'Defenders win round!'}`,
            winnerId: winner?.winnerId || null,
          };
        }

        return {
          ...state,
          phase: 'trick_end',
          players: updatedPlayers,
          currentTrick: newTrick,
          tricksPlayed: newTricksPlayed,
          currentPlayerIndex: winnerIdx,
          lastAction: `${trickWinnerName} wins the trick`,
        };
      }

      // Next player
      const nextPlayer = (pi + 1) % NUM_PLAYERS;
      return {
        ...state,
        players: updatedPlayers,
        currentTrick: newTrick,
        currentPlayerIndex: nextPlayer,
        lastAction: `${player.name} plays ${VALUE_NAMES[card.value]} de ${SUIT_NAMES[card.suit]}`,
      };
    }

    case 'NEXT_TRICK': {
      if (state.phase !== 'trick_end') return state;
      // Trick winner leads the next trick
      return {
        ...state,
        phase: 'playing',
        currentTrick: { cards: [], leadSuit: null, winnerId: null },
        lastAction: 'New trick',
      };
    }

    case 'NEW_ROUND': {
      if (state.phase !== 'scoring') return state;
      const newDealer = (state.dealerIndex + 1) % NUM_PLAYERS;
      return dealCards({
        ...state,
        dealerIndex: newDealer,
      });
    }

    case 'RESET': {
      return initGame();
    }

    default:
      return state;
  }
}

// ============================================================
// HELPERS
// ============================================================

export function formatCard(card: Card): string {
  return `${VALUE_NAMES[card.value]} de ${SUIT_NAMES[card.suit]}`;
}

export function createBots(count: number): GameAction[] {
  const names = ['Antoine', 'Sophie', 'Pierre'];
  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    type: 'JOIN' as const,
    playerId: `bot-${i + 1}`,
    playerName: names[i],
    isBot: true,
  }));
}

export function getCurrentPlayer(state: GameState): Player | null {
  return state.players[state.currentPlayerIndex] || null;
}

export function isPlayerTurn(state: GameState, playerId: string): boolean {
  return getCurrentPlayer(state)?.id === playerId;
}
