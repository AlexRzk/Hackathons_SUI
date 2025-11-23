#!/usr/bin/env python3
"""Test du système de combat avec Gemini AI"""

import os
os.environ["USE_GEMINI"] = "true"
os.environ["GEMINI_API_KEY"] = "AIzaSyCKeAVWuFOHFi-ZSlFKUL2ZUj_eOp1MU18"

from battle_engine import Monster, BattleEngine

# Créer deux monstres pour le test
dragon = Monster(
    monster_id="1",
    name="Dragon Rouge",
    strength=85,
    agility=60,
    intelligence=70,
    level=5
)

phoenix = Monster(
    monster_id="2", 
    name="Phoenix Doré",
    strength=65,
    agility=90,
    intelligence=80,
    level=5
)

print("\n" + "="*60)
print("TEST COMBAT AVEC GEMINI AI")
print("="*60)
print(f"\n{dragon.name} VS {phoenix.name}\n")

# Lancer le combat
engine = BattleEngine(dragon, phoenix)
result = engine.simulate_battle()

print("\n" + "="*60)
print("RÉSULTAT DU COMBAT")
print("="*60)
print(f"Vainqueur ID: {result['winner_id']}")
print(f"Durée: {result['total_turns']} tours")
print(f"XP gagné: {result['xp_gain']}")
print(f"HP final du vainqueur: {result['winner_final_hp']}/100")

# Afficher quelques tours
print(f"\nDerniers tours:")
for turn in result['battle_log'][-3:]:
    print(f"  Tour {turn['turn']}: {turn.get('m1_action', 'N/A')} vs {turn.get('m2_action', 'N/A')}")
