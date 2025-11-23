export enum BattleAction {
  FORCE = 'FORCE',
  INTELLIGENCE = 'INTELLIGENCE',
  AGILITY = 'AGILITY',
}

export type BattleMonster = {
  id: string;
  name: string;
  strength: number;
  agility: number;
  intelligence: number;
  level: number;
  origin?: 'wallet' | 'demo';
};

export type BattleTurnLog = {
  turn: number;
  playerAction: BattleAction;
  opponentAction: BattleAction;
  damageToOpponent: number;
  damageToPlayer: number;
  playerHp: number;
  opponentHp: number;
  playerCountered: boolean;
  opponentCountered: boolean;
};

export type BattleResult = {
  id: string;
  winnerId: string;
  loserId: string;
  xpGain: number;
  turns: BattleTurnLog[];
  winnerFinalHp: number;
  totalTurns: number;
  playerFinalHp: number;
  opponentFinalHp: number;
  strategyNote: string;
};

const COUNTER_MATRIX: Record<BattleAction, BattleAction> = {
  [BattleAction.FORCE]: BattleAction.AGILITY,
  [BattleAction.INTELLIGENCE]: BattleAction.FORCE,
  [BattleAction.AGILITY]: BattleAction.INTELLIGENCE,
};

const ACTION_TARGETS: Record<BattleAction, keyof Pick<BattleMonster, 'strength' | 'agility' | 'intelligence'>> = {
  [BattleAction.FORCE]: 'intelligence',
  [BattleAction.INTELLIGENCE]: 'agility',
  [BattleAction.AGILITY]: 'strength',
};

const ACTION_STATS: Record<BattleAction, keyof Pick<BattleMonster, 'strength' | 'agility' | 'intelligence'>> = {
  [BattleAction.FORCE]: 'strength',
  [BattleAction.INTELLIGENCE]: 'intelligence',
  [BattleAction.AGILITY]: 'agility',
};

const MAX_TURNS = 15;

export type BattleSimulationConfig = {
  player: BattleMonster;
  opponent: BattleMonster;
  rng?: () => number;
};

const randomAction = (rng: () => number): BattleAction => {
  const values = Object.values(BattleAction);
  const index = Math.floor(rng() * values.length);
  return values[index] ?? BattleAction.FORCE;
};

const dominantStat = (
  monster: BattleMonster,
): keyof Pick<BattleMonster, 'strength' | 'agility' | 'intelligence'> => {
  const entries: Array<{
    key: keyof Pick<BattleMonster, 'strength' | 'agility' | 'intelligence'>;
    value: number;
  }> = [
    { key: 'strength', value: monster.strength },
    { key: 'agility', value: monster.agility },
    { key: 'intelligence', value: monster.intelligence },
  ];

  entries.sort((a, b) => b.value - a.value);
  return entries[0]?.key ?? 'strength';
};

const predictEnemyAction = (enemy: BattleMonster): BattleAction => {
  const prediction = dominantStat(enemy);

  switch (prediction) {
    case 'agility':
      return BattleAction.AGILITY;
    case 'intelligence':
      return BattleAction.INTELLIGENCE;
    case 'strength':
    default:
      return BattleAction.FORCE;
  }
};

const chooseAgentAction = (self: BattleMonster, enemy: BattleMonster, rng: () => number): BattleAction => {
  const predicted = predictEnemyAction(enemy);
  const perfectCounter = COUNTER_MATRIX[predicted];
  const intelligenceFactor = Math.min(self.intelligence / 100, 0.95);

  if (rng() < intelligenceFactor) {
    return perfectCounter;
  }

  return randomAction(rng);
};

const chooseFakeOpponentAction = (self: BattleMonster, enemy: BattleMonster, rng: () => number): BattleAction => {
  const disciplinedPlayProbability = Math.min(self.intelligence / 120, 0.8);
  if (rng() < disciplinedPlayProbability) {
    return COUNTER_MATRIX[predictEnemyAction(enemy)];
  }
  return randomAction(rng);
};

const calculateDamage = (
  attacker: BattleMonster & { hp: number },
  defender: BattleMonster & { hp: number },
  action: BattleAction,
  isCounter: boolean,
): number => {
  const attackStat = attacker[ACTION_STATS[action]];
  let baseDamage = Math.max(Math.floor(attackStat / 2), 1);

  if (isCounter) {
    baseDamage = Math.floor(baseDamage * 1.5);
  }

  const defenseStat = defender[ACTION_TARGETS[action]];
  const reduction = Math.floor(defenseStat / 4);

  return Math.max(baseDamage - reduction, 1);
};

export function simulateBattle({ player, opponent, rng = Math.random }: BattleSimulationConfig): BattleResult {
  const playerFighter = { ...player, hp: 100 };
  const opponentFighter = { ...opponent, hp: 100 };
  const turns: BattleTurnLog[] = [];

  for (let turn = 1; turn <= MAX_TURNS; turn += 1) {
    const playerAction = chooseAgentAction(playerFighter, opponentFighter, rng);
    const opponentAction = chooseFakeOpponentAction(opponentFighter, playerFighter, rng);

    const playerCountered = COUNTER_MATRIX[opponentAction] === playerAction;
    const opponentCountered = COUNTER_MATRIX[playerAction] === opponentAction;

    const damageToOpponent = calculateDamage(playerFighter, opponentFighter, playerAction, playerCountered);
    const damageToPlayer = calculateDamage(opponentFighter, playerFighter, opponentAction, opponentCountered);

    opponentFighter.hp = Math.max(opponentFighter.hp - damageToOpponent, 0);
    playerFighter.hp = Math.max(playerFighter.hp - damageToPlayer, 0);

    turns.push({
      turn,
      playerAction,
      opponentAction,
      damageToOpponent,
      damageToPlayer,
      playerHp: playerFighter.hp,
      opponentHp: opponentFighter.hp,
      playerCountered,
      opponentCountered,
    });

    if (playerFighter.hp <= 0 || opponentFighter.hp <= 0) {
      break;
    }
  }

  const playerWins = playerFighter.hp > opponentFighter.hp;
  const winnerId = playerWins ? player.id : opponent.id;
  const loserId = playerWins ? opponent.id : player.id;
  const defeatedLevel = playerWins ? opponent.level : player.level;
  const xpGain = 20 + defeatedLevel * 5;

  const strategyNote = `Trinity Tactics AI predicted ${opponent.name}'s ${dominantStat(opponent)} focus to counter.`;

  const id = (() => {
    const globalCrypto = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
    if (globalCrypto?.randomUUID) {
      return globalCrypto.randomUUID().slice(0, 12);
    }
    const entropy = Math.max(Math.floor(rng() * 1e12), 0);
    return `battle-${entropy.toString(36).padStart(8, '0')}`;
  })();

  return {
    id,
    winnerId,
    loserId,
    xpGain,
    turns,
    winnerFinalHp: Math.max(playerFighter.hp, opponentFighter.hp),
    totalTurns: turns.length,
    playerFinalHp: playerFighter.hp,
    opponentFinalHp: opponentFighter.hp,
    strategyNote,
  };
}

export const demoOpponents: BattleMonster[] = [
  {
    id: 'demo-onyx-warden',
    name: 'Onyx Warden',
    strength: 48,
    agility: 28,
    intelligence: 32,
    level: 3,
    origin: 'demo',
  },
  {
    id: 'demo-neon-wisp',
    name: 'Neon Wisp',
    strength: 32,
    agility: 55,
    intelligence: 26,
    level: 2,
    origin: 'demo',
  },
  {
    id: 'demo-crimson-oracle',
    name: 'Crimson Oracle',
    strength: 26,
    agility: 30,
    intelligence: 52,
    level: 4,
    origin: 'demo',
  },
];

export const demoRoster: BattleMonster[] = [
  {
    id: 'demo-aegis-hatchling',
    name: 'Aegis Hatchling',
    strength: 40,
    agility: 35,
    intelligence: 30,
    level: 2,
    origin: 'demo',
  },
  {
    id: 'demo-cobalt-runner',
    name: 'Cobalt Runner',
    strength: 30,
    agility: 52,
    intelligence: 28,
    level: 3,
    origin: 'demo',
  },
  {
    id: 'demo-psi-seer',
    name: 'Psi Seer',
    strength: 24,
    agility: 32,
    intelligence: 56,
    level: 4,
    origin: 'demo',
  },
];
