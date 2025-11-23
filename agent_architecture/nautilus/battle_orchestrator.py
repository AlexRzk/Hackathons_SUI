#!/usr/bin/env python3
"""
CHIMERA BATTLE ORCHESTRATOR
============================
Coordinates between battle simulation (off-chain) and blockchain settlement (on-chain).
"""

import requests
import json
from battle_engine import Monster, BattleEngine

# === CONFIGURATION ===
NIMBUS_BRIDGE_URL = "http://nimbus-bridge:3001"

# === MONSTER LOADING FROM BLOCKCHAIN ===
def fetch_monster_from_chain(monster_object_id: str) -> Monster:
    """
    Fetch monster stats from the blockchain using Sui RPC.
    In production, this would query the actual object.
    For now, we'll simulate with mock data.
    """
    # TODO: Implement actual RPC call
    # response = requests.post(NIMBUS_BRIDGE_URL + "/rpc", json={
    #     "method": "sui_getObject",
    #     "params": [monster_object_id]
    # })
    
    # Mock data for demonstration
    mock_monsters = {
        "0xMONSTER_A": Monster("0xMONSTER_A", "DragonLord", 50, 35, 45, 3),
        "0xMONSTER_B": Monster("0xMONSTER_B", "ShadowWolf", 40, 55, 35, 2),
    }
    
    return mock_monsters.get(monster_object_id, 
                            Monster(monster_object_id, "Unknown", 30, 30, 30, 1))


# === BATTLE SETTLEMENT ON BLOCKCHAIN ===
def settle_battle_on_chain(winner_id: str, loser_id: str, xp_gain: int, battle_log: list):
    """
    Call the Nimbus Bridge to execute settle_battle on-chain.
    This requires the EXECUTE_MOVE_CALL action we created earlier.
    """
    
    # Upload battle log to Walrus first
    # TODO: Implement Walrus upload
    replay_blob_id = "WALRUS_SIMULATION_BLOB"
    
    # Prepare the moveCall parameters for settle_battle
    move_call_params = {
        "packageObjectId": "0xPACKAGE_ID",  # TODO: Replace with deployed package
        "module": "monster_battle",
        "function": "settle_battle",
        "arguments": [
            {"type": "object", "value": "0xBATTLE_CONFIG_ID"},  # BattleConfig shared object
            {"type": "object", "value": winner_id},  # Winner Monster object
            {"type": "object", "value": loser_id},  # Loser Monster object
            {"type": "pure", "value": xp_gain},  # XP amount
        ],
        "typeArguments": []
    }
    
    try:
        response = requests.post(
            f"{NIMBUS_BRIDGE_URL}/execute",
            json={
                "action": "EXECUTE_MOVE_CALL",
                "params": move_call_params
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Battle settled on-chain: {result}")
            return result
        else:
            print(f"❌ Failed to settle battle: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error settling battle: {e}")
        return None


# === MAIN ORCHESTRATION ===
def run_battle_and_settle(monster1_id: str, monster2_id: str):
    """
    Complete battle flow:
    1. Read monster stats from blockchain
    2. Simulate battle off-chain
    3. Settle result on-chain
    """
    
    print("\n" + "="*60)
    print("CHIMERA BATTLE ORCHESTRATOR")
    print("="*60 + "\n")
    
    # Step 1: Load monsters from blockchain
    print("[1/3] Loading monsters from blockchain...")
    monster1 = fetch_monster_from_chain(monster1_id)
    monster2 = fetch_monster_from_chain(monster2_id)
    print(f"  ✓ {monster1.name} (STR:{monster1.strength} AGI:{monster1.agility} INT:{monster1.intelligence})")
    print(f"  ✓ {monster2.name} (STR:{monster2.strength} AGI:{monster2.agility} INT:{monster2.intelligence})")
    
    # Step 2: Simulate battle
    print("\n[2/3] Simulating battle off-chain (TEE)...")
    engine = BattleEngine(monster1, monster2)
    result = engine.simulate_battle()
    
    # Step 3: Settle on blockchain
    print("\n[3/3] Settling battle on blockchain...")
    settlement = settle_battle_on_chain(
        result["winner_id"],
        result["loser_id"],
        result["xp_gain"],
        result["battle_log"]
    )
    
    if settlement:
        print("\n🎉 BATTLE COMPLETE!")
        print(f"   Winner: {result['winner_id']}")
        print(f"   XP Gained: {result['xp_gain']}")
        print(f"   Total Turns: {result['total_turns']}")
    else:
        print("\n⚠️  Battle simulated but settlement failed (check Nimbus Bridge)")
    
    return result


# === CLI ENTRY POINT ===
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 3:
        # Run with command-line arguments
        monster1_id = sys.argv[1]
        monster2_id = sys.argv[2]
    else:
        # Use defaults
        monster1_id = "0xMONSTER_A"
        monster2_id = "0xMONSTER_B"
    
    run_battle_and_settle(monster1_id, monster2_id)
