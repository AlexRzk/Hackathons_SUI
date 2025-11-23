#!/usr/bin/env python3
"""
CHIMERA BATTLE ENGINE - Trinity Tactics AI
===========================================
Off-chain battle simulation with optimized AI decision-making.
Implements the Stone-Paper-Scissors combat system weighted by monster stats.
Uses Gemini AI for intelligent attack selection.
"""

import random
import enum
import time
import os
import requests
import hashlib
import json
from typing import List, Dict, Optional, Tuple
from enum import Enum

# Import Gemini AI (optionnel)
try:
    from gemini_trader import GeminiTrader
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# === COMBAT ACTIONS (Trinity System) ===
class Action(Enum):
    FORCE = "FORCE"  # 🔴 Crushing Blow (targets Intelligence, weak to Agility)
    INTELLIGENCE = "INTELLIGENCE"  # 🔵 Spell (targets Agility, weak to Force)
    AGILITY = "AGILITY"  # 🟢 Counter-Attack (targets Force, weak to Intelligence)

# === COMBAT COUNTERS (What Beats What) ===
COUNTER_MATRIX = {
    Action.FORCE: Action.AGILITY,  # Force is countered by Agility
    Action.INTELLIGENCE: Action.FORCE,  # Intelligence is countered by Force
    Action.AGILITY: Action.INTELLIGENCE,  # Agility is countered by Intelligence
}

TARGETS = {
    Action.FORCE: "intelligence",  # Force targets Intelligence
    Action.INTELLIGENCE: "agility",  # Intelligence targets Agility
    Action.AGILITY: "strength",  # Agility targets Strength (uses enemy's force against them)
}

# === MONSTER REPRESENTATION ===
class Monster:
    def __init__(self, monster_id: str, name: str, strength: int, agility: int, intelligence: int, level: int = 1):
        self.id = monster_id
        self.name = name
        self.strength = strength
        self.agility = agility
        self.intelligence = intelligence
        self.level = level
        self.hp = 100  # Starting HP for battle simulation
        
    def get_stat(self, stat_name: str) -> int:
        """Get a specific stat value."""
        return getattr(self, stat_name)
    
    def get_dominant_stat(self) -> Tuple[str, int]:
        """Identify the monster's highest stat."""
        stats = {
            "strength": self.strength,
            "agility": self.agility,
            "intelligence": self.intelligence
        }
        dominant = max(stats.items(), key=lambda x: x[1])
        return dominant[0], dominant[1]
    
    def to_dict(self) -> Dict:
        """Serialize monster for logging."""
        return {
            "id": self.id,
            "name": self.name,
            "strength": self.strength,
            "agility": self.agility,
            "intelligence": self.intelligence,
            "level": self.level,
            "hp": self.hp
        }

# === OPTIMIZED AI DECISION ALGORITHM ===
class BattleAI:
    """
    Advanced AI that uses the Trinity Tactics system.
    Intelligence stat affects prediction accuracy.
    """
    
    @staticmethod
    def predict_enemy_action(enemy: Monster) -> Action:
        """Predict what the enemy will do based on their dominant stat."""
        dominant_stat, _ = enemy.get_dominant_stat()
        
        # Map dominant stat to likely action
        stat_to_action = {
            "strength": Action.FORCE,
            "agility": Action.AGILITY,
            "intelligence": Action.INTELLIGENCE
        }
        
        return stat_to_action[dominant_stat]
    
    @staticmethod
    def choose_action(self_monster: Monster, enemy: Monster) -> Action:
        """
        OPTIMIZED AI DECISION LOGIC
        
        Algorithm:
        1. Predict enemy's most likely move based on their dominant stat
        2. Choose the counter-action
        3. Add intelligence-based randomness (high INT = better decisions)
        """
        
        # Step 1: Predict enemy move
        predicted_enemy_action = BattleAI.predict_enemy_action(enemy)
        
        # Step 2: Identify the perfect counter
        perfect_counter = COUNTER_MATRIX[predicted_enemy_action]
        
        # Step 3: Intelligence-based decision quality
        # High intelligence = higher chance to play the perfect counter
        # Low intelligence = more randomness
        
        intelligence_factor = self_monster.intelligence / 100.0  # Normalize to 0-1
        intelligence_factor = min(intelligence_factor, 0.95)  # Cap at 95% perfection
        
        if random.random() < intelligence_factor:
            # Play the perfect counter
            chosen_action = perfect_counter
        else:
            # Play randomly (simulates mistakes or unpredictability)
            chosen_action = random.choice(list(Action))
        
        return chosen_action


# === GEMINI AI FOR BATTLE ===
class BattleGeminiAI:
    """
    Utilise Gemini AI pour choisir les attaques de manière intelligente
    """
    
    def __init__(self):
        """Initialise Gemini AI si disponible"""
        self.gemini = None
        if GEMINI_AVAILABLE:
            api_key = os.getenv("GEMINI_API_KEY")
            if api_key:
                try:
                    self.gemini = GeminiTrader(api_key)
                    print("[BATTLE AI] Gemini activé pour les combats")
                except Exception as e:
                    print(f"[BATTLE AI] Erreur init Gemini: {str(e)[:50]}")
    
    def choose_action(self, attacker: Monster, defender: Monster, turn: int, battle_history: List[Dict]) -> Optional[Action]:
        """
        Demande à Gemini de choisir la meilleure attaque
        
        Returns:
            Action si Gemini est disponible et répond, None sinon
        """
        if not self.gemini:
            return None
        
        try:
            # Construire le prompt pour Gemini
            prompt = self._build_battle_prompt(attacker, defender, turn, battle_history)
            
            # Appeler Gemini
            response = self.gemini.model.generate_content(prompt)
            
            # Parser la réponse
            action = self._parse_battle_response(response.text)
            
            if action:
                print(f"   [GEMINI] 🧠 {attacker.name} utilise {action.value}")
                return action
            
        except Exception as e:
            print(f"   [GEMINI] Erreur: {str(e)[:50]}")
        
        return None
    
    def _build_battle_prompt(self, attacker: Monster, defender: Monster, turn: int, battle_history: List[Dict]) -> str:
        """Construit le prompt pour Gemini"""
        
        # Historique récent (3 derniers tours)
        recent_history = battle_history[-3:] if len(battle_history) > 0 else []
        history_text = ""
        for h in recent_history:
            history_text += f"  Tour {h.get('turn', 0)}: {h.get('m1_action', 'N/A')} vs {h.get('m2_action', 'N/A')}\n"
        
        prompt = f"""Tu es un expert en stratégie de combat Trinity Tactics.

SYSTÈME DE COMBAT:
- FORCE bat INTELLIGENCE (attaque brutale contre magie)
- INTELLIGENCE bat AGILITY (magie contre vitesse)
- AGILITY bat FORCE (esquive et contre-attaque)

SITUATION ACTUELLE (Tour {turn}):
Attaquant: {attacker.name}
  - HP: {attacker.hp}/100
  - Force: {attacker.strength}
  - Agilité: {attacker.agility}
  - Intelligence: {attacker.intelligence}

Défenseur: {defender.name}
  - HP: {defender.hp}/100
  - Force: {defender.strength}
  - Agilité: {defender.agility}
  - Intelligence: {defender.intelligence}

HISTORIQUE RÉCENT:
{history_text if history_text else "  Aucun historique"}

STRATÉGIE:
1. Analyse les stats de l'adversaire pour prédire son action probable
2. Si adversaire a Force élevée → il jouera probablement FORCE
3. Si adversaire a Agilité élevée → il jouera probablement AGILITY
4. Si adversaire a Intelligence élevée → il jouera probablement INTELLIGENCE
5. Choisis l'action qui CONTRE son action probable

Réponds UNIQUEMENT avec l'action: FORCE, AGILITY ou INTELLIGENCE (un seul mot, rien d'autre)"""
        
        return prompt
    
    def _parse_battle_response(self, response_text: str) -> Optional[Action]:
        """Parse la réponse de Gemini pour extraire l'action"""
        
        # Nettoyer la réponse
        clean_text = response_text.strip().upper()
        
        # Chercher les mots-clés
        if "FORCE" in clean_text:
            return Action.FORCE
        elif "AGILITY" in clean_text or "AGILITÉ" in clean_text or "AGILITE" in clean_text:
            return Action.AGILITY
        elif "INTELLIGENCE" in clean_text:
            return Action.INTELLIGENCE
        
        return None


# === BATTLE ENGINE ===
class BattleEngine:
    """Simulates turn-by-turn combat between two monsters."""
    
    MAX_TURNS = 15
    USE_GEMINI_AI = os.getenv("USE_GEMINI", "false").lower() == "true"
    
    def __init__(self, monster1: Monster, monster2: Monster):
        self.monster1 = monster1
        self.monster2 = monster2
        self.battle_log: List[Dict] = []
        
        # Initialiser Gemini AI pour les combats
        self.gemini_ai = None
        if self.USE_GEMINI_AI and GEMINI_AVAILABLE:
            self.gemini_ai = BattleGeminiAI()
        
    def choose_action(self, attacker: Monster, defender: Monster, turn: int) -> str:
        """
        Choose action using Gemini AI first, then fallback to deterministic logic.
        """
        # 1. Essayer Gemini AI d'abord
        if self.gemini_ai:
            gemini_action = self.gemini_ai.choose_action(attacker, defender, turn, self.battle_log)
            if gemini_action:
                return gemini_action.value
        
        # 2. Fallback: Deterministic Trinity Tactics AI
        # Use the static method from BattleAI class
        return BattleAI.choose_action(attacker, defender).value
        
    def calculate_damage(self, attacker: Monster, defender: Monster, action: Action, is_counter: bool) -> int:
        """
        Calculate damage based on:
        - Attacker's stat used for the action
        - Whether it's a successful counter (bonus damage)
        - Defender's targeted stat (reduces damage)
        """
        
        # Map action to the attacker's stat
        action_to_stat = {
            Action.FORCE: "strength",
            Action.INTELLIGENCE: "intelligence",
            Action.AGILITY: "agility"
        }
        
        attacker_stat_value = attacker.get_stat(action_to_stat[action])
        
        # Base damage from attacker's stat
        base_damage = attacker_stat_value // 2
        
        # Counter bonus (if attacker played the perfect counter)
        if is_counter:
            base_damage = int(base_damage * 1.5)  # 50% bonus
        
        # Defender's targeted stat reduces damage
        target_stat_name = TARGETS[action]
        defender_stat_value = defender.get_stat(target_stat_name)
        damage_reduction = defender_stat_value // 4
        
        final_damage = max(base_damage - damage_reduction, 1)  # At least 1 damage
        
        return final_damage
    
    def resolve_turn(self, turn_num: int) -> Dict:
        """Simulate one turn of combat."""
        
        # Both monsters choose their actions
        # Use self.choose_action which tries AI first
        action1_str = self.choose_action(self.monster1, self.monster2, turn_num)
        action2_str = self.choose_action(self.monster2, self.monster1, turn_num)
        
        # Convert string back to Action enum
        action1 = Action(action1_str)
        action2 = Action(action2_str)
        
        # Determine who countered whom
        m1_countered = (COUNTER_MATRIX[action2] == action1)
        m2_countered = (COUNTER_MATRIX[action1] == action2)
        
        # Calculate damage
        damage_to_m2 = self.calculate_damage(self.monster1, self.monster2, action1, m1_countered)
        damage_to_m1 = self.calculate_damage(self.monster2, self.monster1, action2, m2_countered)
        
        # Apply damage
        self.monster2.hp -= damage_to_m2
        self.monster1.hp -= damage_to_m1
        
        # Log the turn
        turn_log = {
            "turn": turn_num,
            f"{self.monster1.name}_action": action1.value,
            f"{self.monster2.name}_action": action2.value,
            f"{self.monster1.name}_damage_dealt": damage_to_m2,
            f"{self.monster2.name}_damage_dealt": damage_to_m1,
            f"{self.monster1.name}_hp": max(self.monster1.hp, 0),
            f"{self.monster2.name}_hp": max(self.monster2.hp, 0),
            f"{self.monster1.name}_countered": m1_countered,
            f"{self.monster2.name}_countered": m2_countered,
        }
        
        return turn_log
    
    def simulate_battle(self) -> Dict:
        """
        Run the full battle simulation.
        
        Returns:
            Battle result with winner, loser, and replay log
        """
        
        print(f"\n{'='*60}")
        print(f"⚔️  BATTLE START: {self.monster1.name} vs {self.monster2.name}")
        print(f"{'='*60}\n")
        
        for turn in range(1, self.MAX_TURNS + 1):
            turn_log = self.resolve_turn(turn)
            self.battle_log.append(turn_log)
            
            print(f"Turn {turn}: {self.monster1.name} {turn_log[f'{self.monster1.name}_hp']}HP | "
                  f"{self.monster2.name} {turn_log[f'{self.monster2.name}_hp']}HP")
            
            # Check for winner
            if self.monster1.hp <= 0 or self.monster2.hp <= 0:
                break
        
        # Determine winner
        if self.monster1.hp > self.monster2.hp:
            winner = self.monster1
            loser = self.monster2
        else:
            winner = self.monster2
            loser = self.monster1
        
        # Calculate XP (based on loser's level)
        xp_gain = 20 + (loser.level * 5)
        
        print(f"\n🏆 WINNER: {winner.name} (XP +{xp_gain})\n")
        
        # Generate battle result
        result = {
            "winner_id": winner.id,
            "loser_id": loser.id,
            "xp_gain": xp_gain,
            "battle_log": self.battle_log,
            "winner_final_hp": winner.hp,
            "total_turns": len(self.battle_log),
            "timestamp": int(hashlib.md5(str(self.battle_log).encode()).hexdigest(), 16) % 10000
        }
        
        return result


# === EXAMPLE USAGE ===
if __name__ == "__main__":
    # Create two test monsters
    dragon = Monster(
        monster_id="0xDRAGON123",
        name="FireDrake",
        strength=45,
        agility=30,
        intelligence=25,
        level=3
    )
    
    golem = Monster(
        monster_id="0xGOLEM456",
        name="StoneGolem",
        strength=50,
        agility=20,
        intelligence=30,
        level=2
    )
    
    # Run battle
    engine = BattleEngine(dragon, golem)
    result = engine.simulate_battle()
    
    # Print result
    print("\n=== BATTLE RESULT ===")
    print(json.dumps(result, indent=2, default=str))
