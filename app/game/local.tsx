/**
 * @file game/local.tsx
 * @description Local Tarot game screen - Simplified trick-taking vs 3 bots
 * @project SallyCards - Tarot
 */

import React, { useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  gameReducer,
  initGame,
  botPlay,
  getCurrentPlayer,
  isPlayerTurn,
  getPlayableCards,
  SUIT_NAMES,
  VALUE_NAMES,
  type GameState,
  type Suit,
} from '../../src/game/tarotEngine';
import {
  parseDifficulty, BOT_PRESETS, thinkDelay, shouldRandomize,
  difficultyBadge, difficultyColor,
} from '@sally/game-engine';
import { getCardImage, getCardBackImage } from '../../src/game/cardAssets';

const CARD_WIDTH = 52;
const CARD_HEIGHT = 78;
const PLAYER_CARD_WIDTH = 56;
const PLAYER_CARD_HEIGHT = 84;

const PLAYER_ID = 'player-1';
const BOT_DELAY = 1000;

export default function TarotLocalGame() {
  const router = useRouter();
  const params = useLocalSearchParams<{ difficulty?: string }>();
  const difficulty = useMemo(() => parseDifficulty(params.difficulty), [params.difficulty]);
  const botConfig = BOT_PRESETS[difficulty];
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    let s = initGame();
    s = gameReducer(s, {
      type: 'JOIN',
      playerId: PLAYER_ID,
      playerName: 'You',
    });
    s = gameReducer(s, {
      type: 'JOIN',
      playerId: 'bot-1',
      playerName: 'Antoine',
      isBot: true,
    });
    s = gameReducer(s, {
      type: 'JOIN',
      playerId: 'bot-2',
      playerName: 'Sophie',
      isBot: true,
    });
    s = gameReducer(s, {
      type: 'JOIN',
      playerId: 'bot-3',
      playerName: 'Pierre',
      isBot: true,
    });
    s = gameReducer(s, { type: 'START_GAME' });
    return s;
  });

  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bot auto-play
  useEffect(() => {
    const current = getCurrentPlayer(state);
    if (!current || !current.isBot) return;
    if (state.phase === 'waiting' || state.phase === 'scoring' || state.phase === 'game_over') return;

    botTimerRef.current = setTimeout(() => {
      let action = botPlay(state);
      // Humanisation : easy/medium peut jouer sous-optimal
      if (action && shouldRandomize(botConfig) && current.hand.length > 1) {
        const playable = getPlayableCards(current.hand, state.currentTrick.leadSuit);
        if (playable.length > 0) {
          const rnd = playable[Math.floor(Math.random() * playable.length)];
          action = { type: 'PLAY_CARD', playerId: current.id, cardId: rnd.id } as any;
        }
      }
      if (action) {
        dispatch(action);
      }
    }, thinkDelay(botConfig));

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [state]);

  // Auto-advance trick_end
  useEffect(() => {
    if (state.phase === 'trick_end') {
      const timer = setTimeout(() => {
        dispatch({ type: 'NEXT_TRICK' });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.tricksPlayed]);

  const humanPlayer = state.players.find((p) => p.id === PLAYER_ID);
  const isMyTurn = isPlayerTurn(state, PLAYER_ID);

  const playableCards = humanPlayer
    ? getPlayableCards(humanPlayer.hand, state.currentTrick.leadSuit)
    : [];
  const playableIds = new Set(playableCards.map((c) => c.id));

  const handlePlayCard = useCallback(
    (cardId: string) => {
      if (!isMyTurn || state.phase !== 'playing') return;
      if (!playableIds.has(cardId)) return;
      dispatch({ type: 'PLAY_CARD', playerId: PLAYER_ID, cardId });
    },
    [isMyTurn, state.phase, playableIds]
  );

  const handleBid = useCallback(
    (suit: Suit) => {
      if (!isMyTurn || state.phase !== 'bidding') return;
      dispatch({ type: 'BID', playerId: PLAYER_ID, suit });
    },
    [isMyTurn, state.phase]
  );

  const handlePass = useCallback(() => {
    if (!isMyTurn || state.phase !== 'bidding') return;
    dispatch({ type: 'PASS', playerId: PLAYER_ID });
  }, [isMyTurn, state.phase]);

  const handleNewRound = useCallback(() => {
    dispatch({ type: 'NEW_ROUND' });
  }, []);

  const handleNewGame = useCallback(() => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'JOIN', playerId: PLAYER_ID, playerName: 'You' });
    dispatch({
      type: 'JOIN',
      playerId: 'bot-1',
      playerName: 'Antoine',
      isBot: true,
    });
    dispatch({
      type: 'JOIN',
      playerId: 'bot-2',
      playerName: 'Sophie',
      isBot: true,
    });
    dispatch({
      type: 'JOIN',
      playerId: 'bot-3',
      playerName: 'Pierre',
      isBot: true,
    });
    setTimeout(() => dispatch({ type: 'START_GAME' }), 100);
  }, []);

  const preneurName =
    state.preneurIndex >= 0
      ? state.players[state.preneurIndex]?.name
      : null;

  return (
    <LinearGradient colors={['#78350F', '#D97706', '#B45309']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Tarot</Text>
          <View style={[styles.diffBadge, { backgroundColor: difficultyColor(difficulty) }]}>
            <Text style={styles.diffBadgeText}>{difficultyBadge(difficulty)}</Text>
          </View>
          <Text style={styles.phaseText}>
            {state.phase.toUpperCase()} | Round {state.roundNumber} | Trick{' '}
            {state.tricksPlayed + 1}/10
          </Text>
        </View>

        {/* Game Info */}
        <View style={styles.infoRow}>
          {state.trumpSuit && (
            <Text style={styles.trumpText}>
              Trump: {SUIT_NAMES[state.trumpSuit]}
            </Text>
          )}
          {preneurName && (
            <Text style={styles.preneurText}>Preneur: {preneurName}</Text>
          )}
        </View>

        {/* Opponents */}
        <View style={styles.opponentsRow}>
          {state.players
            .filter((p) => p.id !== PLAYER_ID)
            .map((bot) => (
              <View
                key={bot.id}
                style={[
                  styles.opponentBox,
                  getCurrentPlayer(state)?.id === bot.id && styles.activePlayer,
                ]}
              >
                <Text style={styles.opponentName}>{bot.name}</Text>
                <Text style={styles.trickCount}>
                  Tricks: {bot.tricksWon} | Score: {bot.score}
                </Text>
                <Text style={styles.cardCount}>{bot.hand.length} cards</Text>
              </View>
            ))}
        </View>

        {/* Current Trick */}
        <View style={styles.trickArea}>
          <Text style={styles.trickLabel}>Current Trick</Text>
          <View style={styles.trickCards}>
            {state.currentTrick.cards.map(({ playerId, card }) => {
              const player = state.players.find((p) => p.id === playerId);
              return (
                <View key={card.id} style={styles.trickCardWrapper}>
                  <Image
                    source={getCardImage(card.id)}
                    style={styles.trickCard}
                  />
                  <Text style={styles.trickPlayerName}>
                    {player?.name || ''}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Status */}
        <Text style={styles.statusText}>{state.lastAction}</Text>

        {/* Bidding Phase */}
        {state.phase === 'bidding' && isMyTurn && (
          <View style={styles.biddingArea}>
            <Text style={styles.biddingTitle}>Choose Trump Suit:</Text>
            <View style={styles.bidButtons}>
              {(['bastos', 'copas', 'espadas', 'oros'] as Suit[]).map(
                (suit) => (
                  <TouchableOpacity
                    key={suit}
                    style={styles.bidBtn}
                    onPress={() => handleBid(suit)}
                  >
                    <Text style={styles.bidText}>{SUIT_NAMES[suit]}</Text>
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity style={styles.passBtn} onPress={handlePass}>
                <Text style={styles.bidText}>Pass</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Player Hand */}
        {humanPlayer && state.phase === 'playing' && (
          <View style={styles.playerArea}>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                You {isMyTurn ? '(Your Turn)' : ''} | Tricks: {humanPlayer.tricksWon} | Score: {humanPlayer.score}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.handRow}>
                {humanPlayer.hand.map((card) => {
                  const canPlay = playableIds.has(card.id);
                  return (
                    <TouchableOpacity
                      key={card.id}
                      onPress={() => handlePlayCard(card.id)}
                      disabled={!isMyTurn || !canPlay}
                      style={[!canPlay && isMyTurn && styles.unplayable]}
                    >
                      <Image
                        source={getCardImage(card.id)}
                        style={[
                          styles.playerCard,
                          !canPlay && isMyTurn && styles.dimCard,
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Show hand during bidding */}
        {humanPlayer && state.phase === 'bidding' && (
          <View style={styles.playerArea}>
            <Text style={styles.playerName}>Your Hand:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.handRow}>
                {humanPlayer.hand.map((card) => (
                  <Image
                    key={card.id}
                    source={getCardImage(card.id)}
                    style={styles.playerCard}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Scoring / Game Over */}
        {state.phase === 'scoring' && (
          <View style={styles.scoringArea}>
            <Text style={styles.scoringTitle}>Round Complete!</Text>
            {state.players.map((p) => (
              <Text key={p.id} style={styles.scoreRow}>
                {p.name}: {p.tricksWon} tricks | Score: {p.score}
              </Text>
            ))}
            <TouchableOpacity style={styles.newRoundBtn} onPress={handleNewRound}>
              <Text style={styles.newGameText}>Next Round</Text>
            </TouchableOpacity>
          </View>
        )}

        {state.phase === 'game_over' && (
          <View style={styles.gameOverArea}>
            <Text style={styles.gameOverText}>
              Game Over!{' '}
              {state.players.find((p) => p.id === state.winnerId)?.name} wins!
            </Text>
            <TouchableOpacity style={styles.newGameBtn} onPress={handleNewGame}>
              <Text style={styles.newGameText}>New Game</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 12 },
  header: { alignItems: 'center', paddingVertical: 6 },
  backBtn: { position: 'absolute', left: 0, top: 6 },
  backText: { color: '#FDE68A', fontSize: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  phaseText: { color: '#FDE68A', fontSize: 12, marginTop: 2 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginVertical: 4 },
  diffBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 4,
  },
  trumpText: { color: '#FCD34D', fontWeight: 'bold', fontSize: 14 },
  preneurText: { color: '#FDE68A', fontSize: 14 },
  opponentsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 4,
  },
  opponentBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    padding: 6,
    minWidth: 90,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activePlayer: { borderColor: '#FCD34D' },
  opponentName: { color: '#fff', fontWeight: '600', fontSize: 12 },
  trickCount: { color: '#FDE68A', fontSize: 11 },
  cardCount: { color: '#FDE68A', fontSize: 10 },
  trickArea: { alignItems: 'center', marginVertical: 10 },
  trickLabel: { color: '#FEF3C7', fontSize: 12, marginBottom: 4 },
  trickCards: { flexDirection: 'row', gap: 8 },
  trickCardWrapper: { alignItems: 'center' },
  trickCard: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 5 },
  trickPlayerName: { color: '#FDE68A', fontSize: 10, marginTop: 2 },
  statusText: {
    color: '#FEF3C7',
    textAlign: 'center',
    fontSize: 13,
    marginVertical: 4,
  },
  biddingArea: { alignItems: 'center', marginVertical: 8 },
  biddingTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 8 },
  bidButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  bidBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  passBtn: {
    backgroundColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  bidText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  playerArea: { alignItems: 'center', marginTop: 6 },
  playerInfo: { marginBottom: 4 },
  playerName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  handRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 8 },
  playerCard: {
    width: PLAYER_CARD_WIDTH,
    height: PLAYER_CARD_HEIGHT,
    borderRadius: 5,
  },
  unplayable: { opacity: 0.5 },
  dimCard: { opacity: 0.5 },
  scoringArea: { alignItems: 'center', marginTop: 12 },
  scoringTitle: { color: '#FCD34D', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  scoreRow: { color: '#fff', fontSize: 14, marginVertical: 2 },
  newRoundBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  gameOverArea: { alignItems: 'center', marginTop: 20 },
  gameOverText: { color: '#FCD34D', fontSize: 20, fontWeight: 'bold' },
  newGameBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  newGameText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
