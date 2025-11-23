#!/usr/bin/env python3
"""
NAUTILUS ENCLAVE SIMULATOR
==========================
Simule une enclave TEE avec génération de clés et signature cryptographique.
En production, ce serait remplacé par AWS Nitro Enclaves.
"""

import hashlib
import json
import time
from nacl.signing import SigningKey, VerifyKey
from nacl.encoding import RawEncoder
import os

class EnclaveSimulator:
    """Simule une enclave Nautilus avec signature ED25519"""
    
    def __init__(self):
        """Initialize enclave with ephemeral keypair"""
        # Generate ED25519 keypair (ephemeral - regenerated at each startup)
        self.signing_key = SigningKey.generate()
        self.verify_key = self.signing_key.verify_key
        
        # PCR values (simulated - in real TEE these would be measurements)
        self.pcrs = {
            "PCR0": hashlib.sha256(b"chimera_battle_v1.0.0").hexdigest(),
            "PCR1": hashlib.sha256(b"nautilus_docker_sim").hexdigest(),
            "PCR2": hashlib.sha256(b"trinity_tactics_engine").hexdigest()
        }
        
        print("🔐 [ENCLAVE] Nautilus TEE Simulator initialized")
        print(f"   Public Key: {self.get_public_key_hex()[:32]}...")
        print(f"   PCR0: {self.pcrs['PCR0'][:32]}...")
    
    def get_public_key_hex(self) -> str:
        """Get public key as hex string"""
        return self.verify_key.encode(encoder=RawEncoder).hex()
    
    def get_public_key_bytes(self) -> bytes:
        """Get public key as bytes"""
        return self.verify_key.encode(encoder=RawEncoder)
    
    def sign_battle_result(self, winner_id: str, loser_id: str, xp_gain: int, battle_log: list) -> dict:
        """
        Sign a battle result with the enclave's private key.
        
        Returns:
            dict with signature, public_key, and attestation info
        """
        # Create deterministic payload for signing
        # This MUST match the BCS format expected by Move
        payload = {
            "winner_id": winner_id,
            "loser_id": loser_id,
            "xp_gain": xp_gain,
            "battle_log_hash": self._hash_battle_log(battle_log),
            "timestamp": int(time.time())
        }
        
        # Serialize to canonical JSON (sorted keys for determinism)
        payload_bytes = json.dumps(payload, sort_keys=True).encode()
        
        # Sign with ED25519
        signed = self.signing_key.sign(payload_bytes, encoder=RawEncoder)
        signature = signed.signature
        
        print(f"   [ENCLAVE] ✅ Battle result signed")
        print(f"   Signature: {signature.hex()[:32]}...")
        
        return {
            "signature": signature.hex(),
            "public_key": self.get_public_key_hex(),
            "payload": payload,
            "pcr0": self.pcrs["PCR0"],
            "attestation": self._generate_attestation()
        }
    
    def _hash_battle_log(self, battle_log: list) -> str:
        """Generate SHA256 hash of battle log"""
        log_bytes = json.dumps(battle_log, sort_keys=True).encode()
        return hashlib.sha256(log_bytes).hexdigest()
    
    def _generate_attestation(self) -> dict:
        """Generate simulated attestation document"""
        return {
            "mode": "DOCKER_SIMULATION",
            "pcrs": self.pcrs,
            "public_key": self.get_public_key_hex(),
            "timestamp": int(time.time()),
            "enclave_id": hashlib.sha256(
                (self.get_public_key_hex() + str(time.time())).encode()
            ).hexdigest()[:16]
        }
    
    @staticmethod
    def verify_signature(public_key_hex: str, payload_dict: dict, signature_hex: str) -> bool:
        """
        Verify a signature (can be called statically for testing)
        
        Args:
            public_key_hex: Hex-encoded ED25519 public key
            payload_dict: The original payload dictionary
            signature_hex: Hex-encoded signature
            
        Returns:
            True if signature is valid, False otherwise
        """
        try:
            # Reconstruct verify key
            public_key_bytes = bytes.fromhex(public_key_hex)
            verify_key = VerifyKey(public_key_bytes, encoder=RawEncoder)
            
            # Reconstruct payload bytes (same canonical format)
            payload_bytes = json.dumps(payload_dict, sort_keys=True).encode()
            
            # Convert signature to bytes
            signature_bytes = bytes.fromhex(signature_hex)
            
            # Verify
            verify_key.verify(payload_bytes, signature_bytes, encoder=RawEncoder)
            return True
            
        except Exception as e:
            print(f"   [ENCLAVE] ❌ Signature verification failed: {e}")
            return False


# Global enclave instance (singleton)
_enclave_instance = None

def get_enclave() -> EnclaveSimulator:
    """Get or create the global enclave instance"""
    global _enclave_instance
    if _enclave_instance is None:
        _enclave_instance = EnclaveSimulator()
    return _enclave_instance


# Example usage
if __name__ == "__main__":
    print("\n=== NAUTILUS ENCLAVE SIMULATOR TEST ===\n")
    
    # Initialize enclave
    enclave = get_enclave()
    
    # Simulate battle result
    battle_result = enclave.sign_battle_result(
        winner_id="0xABCD1234",
        loser_id="0xEF567890",
        xp_gain=30,
        battle_log=[
            {"turn": 1, "damage": 10},
            {"turn": 2, "damage": 15}
        ]
    )
    
    print(f"\n✅ Signed Result:")
    print(f"   Winner: {battle_result['payload']['winner_id']}")
    print(f"   Signature: {battle_result['signature'][:64]}...")
    
    # Verify signature
    is_valid = EnclaveSimulator.verify_signature(
        battle_result['public_key'],
        battle_result['payload'],
        battle_result['signature']
    )
    
    print(f"\n🔍 Signature Verification: {'✅ VALID' if is_valid else '❌ INVALID'}")
    
    # Try with tampered data
    tampered_payload = battle_result['payload'].copy()
    tampered_payload['xp_gain'] = 999  # Cheat attempt!
    
    is_valid_tampered = EnclaveSimulator.verify_signature(
        battle_result['public_key'],
        tampered_payload,
        battle_result['signature']
    )
    
    print(f"🔍 Tampered Data Verification: {'✅ VALID' if is_valid_tampered else '❌ INVALID (Expected!)'}")
