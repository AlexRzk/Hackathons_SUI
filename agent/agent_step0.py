# agent_step0.py

import json
import sys
from typing import Dict, Any, List, Optional

import requests

from config import (
    SUI_RPC_URL,
    CHIMERA_ID,
    DNA_INDEX_STR,
    TARGET_STR,
)


class ChimeraAgentError(Exception):
    """Erreur custom pour l'agent Chimère."""
    pass


def sui_rpc_call(method: str, params: list) -> Dict[str, Any]:
    """
    Appelle le RPC Sui en JSON-RPC 2.0.
    """
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params,
    }

    try:
        resp = requests.post(SUI_RPC_URL, json=payload, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        raise ChimeraAgentError(f"Erreur lors de l'appel RPC Sui: {e}") from e

    data = resp.json()
    if "error" in data:
        raise ChimeraAgentError(f"Erreur RPC Sui: {data['error']}")
    return data["result"]


def fetch_chimera_object(chimera_id: str) -> Dict[str, Any]:
    """
    Récupère l'objet Chimera brut via sui_getObject.
    """
    params = [
        chimera_id,
        {
            "showType": True,
            "showContent": True,
            "showOwner": True,
            "showPreviousTransaction": False,
            "showStorageRebate": False,
            "showDisplay": False,
        },
    ]
    result = sui_rpc_call("sui_getObject", params)

    status = result.get("status")
    if status != "Exists":
        raise ChimeraAgentError(f"L'objet {chimera_id} n'existe pas ou n'est pas disponible (status={status})")

    return result


def parse_chimera_state(obj_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extrait l'état logique de la Chimère à partir de la réponse RPC.

    On suppose un struct Move du type :
      struct Chimera { dna: vector<u8>, evolution_stage: u8, ... }

    Tu adapteras les noms de champs en fonction du module réel.
    """
    details = obj_result.get("details") or {}
    data = details.get("data") or {}

    if data.get("dataType") != "moveObject":
        raise ChimeraAgentError("L'objet récupéré n'est pas un MoveObject.")

    content = data.get("content") or {}
    fields = content.get("fields") or {}

    # 🔧 Adapter ces noms une fois que le contrat Move est final
    dna: Optional[List[int]] = fields.get("dna")
    evolution_stage = fields.get("evolution_stage", 0)

    if dna is None:
        raise ChimeraAgentError("Champ 'dna' introuvable dans l'objet Chimera (adapter le parser).")

    if not isinstance(dna, list):
        raise ChimeraAgentError(f"Le champ 'dna' n'est pas une liste : {dna}")

    return {
        "dna": dna,
        "evolution_stage": evolution_stage,
    }


def compute_decision(chimera_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    À partir de l'état de la Chimère, calcule la décision génétique :
    combien de STR il manque pour atteindre TARGET_STR.
    """
    dna: List[int] = chimera_state["dna"]

    try:
        current_str = int(dna[DNA_INDEX_STR])
    except (IndexError, ValueError, TypeError) as e:
        raise ChimeraAgentError(f"Impossible de lire STR dans dna={dna}: {e}") from e

    missing_str = max(TARGET_STR - current_str, 0)

    if missing_str > 0:
        action = "BUY_STR"
        reason = f"STR {current_str} < target {TARGET_STR}"
    else:
        action = "NO_ACTION"
        reason = f"STR {current_str} >= target {TARGET_STR}"

    decision = {
        "dna": dna,
        "current_str": current_str,
        "target_str": TARGET_STR,
        "missing_str": missing_str,
        "action": action,
        "reason": reason,
    }

    return decision


def execute_decision(decision: Dict[str, Any]) -> None:
    """
    Étape suivante (stub) :
    Utiliser Nimbus + DeepBook pour exécuter la décision.
    Pour l'instant, on fait juste un print.
    """
    if decision["action"] == "BUY_STR":
        print(f"[STUB] Je devrais acheter {decision['missing_str']} STR via DeepBook.")
    else:
        print("[STUB] Aucune action nécessaire.")


def main(chimera_id: str) -> int:
    """
    Étape 0 : lit la Chimère on-chain, calcule la décision, imprime un JSON.
    """
    try:
        obj_result = fetch_chimera_object(chimera_id)
        chimera_state = parse_chimera_state(obj_result)
        decision = compute_decision(chimera_state)

        # Print en JSON pour que ce soit facile à consommer par la TEE / backend
        print(json.dumps(
            {
                "chimera_id": chimera_id,
                "decision": decision,
            },
            indent=2,
            ensure_ascii=False,
        ))

        # Appel du stub
        execute_decision(decision)

        return 0

    except ChimeraAgentError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        return 1


# ---------- Blocs de test ----------

def quick_local_test():
    """
    Test local de la logique de décision sans aucun RPC.
    """
    chimera_state = {
        "dna": [10, 20, 5],
        "evolution_stage": 0,
    }
    decision = compute_decision(chimera_state)
    print(json.dumps(decision, indent=2, ensure_ascii=False))
    execute_decision(decision)


def quick_rpc_ping():
    """
    Teste la connexion RPC à Sui avec un appel simple.
    """
    result = sui_rpc_call("sui_getChainIdentifier", [])
    print("RPC OK, chain identifier:", result)


def quick_parse_test():
    """
    Teste parse_chimera_state avec un objet simulé.
    """
    fake_result = {
        "status": "Exists",
        "details": {
            "data": {
                "dataType": "moveObject",
                "content": {
                    "fields": {
                        "dna": [10, 20, 5],
                        "evolution_stage": 0,
                    }
                }
            }
        }
    }

    chimera_state = parse_chimera_state(fake_result)
    decision = compute_decision(chimera_state)

    print("Chimera state parsed:")
    print(json.dumps(chimera_state, indent=2, ensure_ascii=False))
    print("\nDecision:")
    print(json.dumps(decision, indent=2, ensure_ascii=False))
    execute_decision(decision)


# ---------- Entrée principale ----------

if __name__ == "__main__":
    if "--test-local" in sys.argv:
        quick_local_test()
        sys.exit(0)

    if "--test-rpc" in sys.argv:
        quick_rpc_ping()
        sys.exit(0)

    if "--test-parse" in sys.argv:
        quick_parse_test()
        sys.exit(0)

    # Comportement normal
    if len(sys.argv) > 1:
        chimera_id = sys.argv[1]
    else:
        chimera_id = CHIMERA_ID

    sys.exit(main(chimera_id))
