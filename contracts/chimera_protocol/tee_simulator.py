import subprocess
import json
import secrets # Le RNG sécurisé

# --- REMPLACE AVEC TES NOUVEAUX IDS ---
PACKAGE_ID = "0x2cc49178b0381ffeb4eb4af8b6c3f55c6594a242ad2063e3b0530ec1fb0d1b53" 
BATTLE_CONFIG_ID = "0xb46f9f6ad19d7413845a83beeec537d5d80ed2a54009a14f2247e34ba067607c"
GAS_BUDGET = "10000000"

def get_monster_stats(object_id):
    """Lit la blockchain pour avoir les vraies stats"""
    print(f"🔍 Scan du monstre {object_id}...")
    cmd = f"sui client object {object_id} --json"
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    try:
        data = json.loads(result.stdout)
        return data['content']['fields']
    except:
        print("❌ Monstre introuvable !")
        return None

def calculate_score(monster):
    """L'algorithme secret du TEE"""
    str = int(monster['strength'])
    agi = int(monster['agility'])
    inte = int(monster['intelligence'])
    
    # Random sécurisé (0 à 40)
    luck = secrets.randbelow(41) 
    
    # Formule de combat
    score = (str * 1.5) + (agi * 1.2) + (inte * 1.1) + luck
    print(f"   📊 {monster['name']} -> Score: {score:.2f} (Chance: {luck})")
    return score

def send_result_to_blockchain(winner_id, loser_id):
    """Envoie la transaction sur Sui"""
    print(f"🚀 Le TEE déclare {winner_id} vainqueur ! Envoi sur la chaine...")
    cmd = f"""
    sui client call \
    --package {PACKAGE_ID} \
    --module monster_battle \
    --function settle_battle \
    --args {BATTLE_CONFIG_ID} {winner_id} {loser_id} 50 \
    --gas-budget {GAS_BUDGET}
    """
    subprocess.run(cmd, shell=True)

# --- EXECUTION ---
if __name__ == "__main__":
    print("\n⚔️ --- TEE BATTLE SYSTEM --- ⚔️\n")
    
    # Demande les IDs à l'utilisateur
    id_1 = input("ID Monstre 1 : ").strip()
    id_2 = input("ID Monstre 2 : ").strip()

    m1 = get_monster_stats(id_1)
    m2 = get_monster_stats(id_2)

    if m1 and m2:
        print("\n--- 🧮 CALCUL TEE EN COURS ---")
        s1 = calculate_score(m1)
        s2 = calculate_score(m2)
        
        if s1 >= s2:
            print(f"\n🏆 VICTOIRE : {m1['name']} !")
            send_result_to_blockchain(id_1, id_2)
        else:
            print(f"\n🏆 VICTOIRE : {m2['name']} !")
            send_result_to_blockchain(id_2, id_1)