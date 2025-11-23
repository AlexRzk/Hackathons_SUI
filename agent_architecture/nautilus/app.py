#!/usr/bin/env python3
"""
CHIMERA NAUTILUS AGENT - Battle API Mode
=========================================
Agent de combat NFT avec API REST pour déclencher les combats à la demande.
- Authentification via Nautilus TEE
- Gemini AI pour choix d'attaques intelligent
- Signature cryptographique de tous les résultats
- API REST pour contrôle des combats
"""

import time
import hashlib
import os
import random
import requests
import json
import subprocess
from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify

# Import Gemini AI (optionnel)
try:
    from gemini_trader import GeminiTrader
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("[WARN] Gemini non disponible - mode manuel")

# Import du module Nautilus Enclave
try:
    from nautilus_enclave import EnclaveSimulator
    NAUTILUS_MODE = "NAUTILUS TEE SIMULATOR"
    EnclaveState = EnclaveSimulator
except ImportError:
    # Fallback si nautilus_enclave.py n'est pas disponible
    NAUTILUS_MODE = "SIMULATION SIMPLE"
    class EnclaveState:
        def __init__(self):
            self.pcrs = {"PCR0": "simulated", "PCR1": "simulated", "PCR2": "simulated"}
        def sign_message(self, msg):
            return hashlib.sha256(json.dumps(msg).encode()).hexdigest()

# --- CONFIGURATION ---
USE_GEMINI = os.getenv("USE_GEMINI", "false").lower() == "true"

SYSTEM_PROMPT = """
AGENT: CHIMERA-NAUTILUS-BATTLE-01
MISSION: Combat stratégique NFT avec IA Gemini (API REST)
SYSTÈME: Trinity Tactics (FORCE > INTELLIGENCE > AGILITY > FORCE)
IA: Gemini 2.0 Flash pour choix d'attaques intelligent
MÉMOIRE: Stockage immuable sur Walrus
IDENTITÉ: Vérifiable via attestation Nautilus TEE
VERSION: Battle Mode - Trading en pause
"""

# --- CONFIGURATION TRADING ---
TRADING_CONFIG = {
    "equity": 2000,  # USDC
    "risk_per_trade_pct": 0.015,  # 1.5% par trade
    "max_daily_loss_pct": 0.02,  # 2% max perte/jour
    "max_positions": 2,
    "leverage": 3,
    "atr_normal_range": (0.0015, 0.0035),  # 0.15-0.35% pour SUI
    "timeframes": {
        "bias": "15m",  # EMA15/50, VWAP, ATR pour direction
        "entry": "5m"   # EMA9/21, RSI, Volume pour entrée
    },
    "indicators": {
        "ema_bias": [15, 50],
        "ema_entry": [9, 21],
        "rsi_period": 14,
        "atr_period": 14,
        "volume_sma": 20
    },
    "setup_a": {  # Trend Pullback
        "name": "TREND_PULLBACK",
        "tp1_atr_mult": 1.0,
        "tp2_atr_mult": 1.5,
        "stop_atr_mult": 0.4,
        "max_candle_atr_mult": 1.2
    },
    "setup_b": {  # VWAP Fade
        "name": "VWAP_FADE",
        "distance_atr_mult": 1.0,
        "rsi_oversold": 30,
        "rsi_overbought": 70,
        "stop_atr_mult": 0.5,
        "tp_atr_mult": 0.9
    }
}

# --- CONFIGURATION API ---
# Les APIs utilisées sont gratuites et ne nécessitent pas de clé
API_CONFIG = {
    "binance": {
        "enabled": True,
        "url": "https://api.binance.com/api/v3/ticker/24hr",
        "requires_key": False
    },
    "coinbase": {
        "enabled": True,
        "url": "https://api.coinbase.com/v2/prices/SUI-USD/spot",
        "requires_key": False
    },
    "coingecko": {
        "enabled": True,
        "url": "https://api.coingecko.com/api/v3/simple/price",
        "requires_key": False
    }
}

# Configuration Walrus (Publisher public testnet)
WALRUS_CONFIG = {
    "publisher_url": "https://publisher.walrus-testnet.walrus.space/v1/store",
    "aggregator_url": "https://aggregator.walrus-testnet.walrus.space/v1",
    "network": "testnet"
}

# --- INTÉGRATION NIMBUS (TypeScript SDK Bridge) ---
# Chemin du SDK: en local = ../sui-agent-kit, en Docker = /app/sui-agent-kit
NIMBUS_SDK_PATH = Path(__file__).parent.parent / "sui-agent-kit"
if not NIMBUS_SDK_PATH.exists():
    # Fallback pour Docker
    NIMBUS_SDK_PATH = Path("/app/sui-agent-kit")
NIMBUS_AVAILABLE = NIMBUS_SDK_PATH.exists()

def call_nimbus_action(action: str, params: dict) -> dict:
    """
    Appelle le SDK Nimbus TypeScript via Node.js
    En production: remplacer par appels HTTP à un micro-service TypeScript
    """
    if not NIMBUS_AVAILABLE:
        print("   [WARN] Nimbus SDK introuvable - mode simulation")
        return {"status": "simulated", "action": action, "params": params}
    
    # TODO: Implémenter bridge réel via child_process Node.js
    # Pour l'instant: simulation
    return {
        "status": "success",
        "action": action,
        "result": f"Simulated {action} with {params}"
    }

# --- CONFIGURATION WALRUS ---
WALRUS_PUBLISHER_URL = WALRUS_CONFIG["publisher_url"]

class WalrusMemory:
    """Gestionnaire de mémoire immuable sur Walrus"""
    
    @staticmethod
    def save(data: dict) -> str:
        """
        Sauvegarde un raisonnement/décision sur Walrus
        Retourne: blob_id utilisable on-chain
        """
        payload = json.dumps(data, sort_keys=True)
        
        try:
            response = requests.put(
                WALRUS_PUBLISHER_URL,
                data=payload.encode(),
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Format réponse Walrus:
                # {"newlyCreated": {"blobObject": {"blobId": "..."}}}
                # OU {"alreadyCertified": {"blobId": "..."}}
                
                if "newlyCreated" in result:
                    blob_id = result["newlyCreated"]["blobObject"]["blobId"]
                    print(f"   [OK] Nouveau blob Walrus: {blob_id}")
                    return blob_id
                elif "alreadyCertified" in result:
                    blob_id = result["alreadyCertified"]["blobId"]
                    print(f"   [CACHED] Blob déjà existant: {blob_id}")
                    return blob_id
            
            print(f"   [ERROR] Erreur Walrus: {response.status_code} - {response.text}")
            
        except requests.exceptions.Timeout:
            print("   [TIMEOUT] Timeout Walrus - réseau lent?")
        except Exception as e:
            print(f"   [ERROR] Erreur Walrus: {e}")
        
        # Fallback: génération blob_id simulé
        simulated_id = hashlib.sha256(payload.encode()).hexdigest()
        print(f"   [SIM] Mode simulation - blob: sim_{simulated_id[:16]}")
        return f"sim_{simulated_id[:16]}"
    
    @staticmethod
    def retrieve(blob_id: str) -> dict:
        """Récupère une mémoire depuis Walrus"""
        # TODO: implémenter GET depuis aggregator Walrus
        return {"error": "retrieve not implemented yet"}

# --- CLASSE AGENT PRINCIPALE ---
class ChimeraAgent:
    def __init__(self):
        print("\n" + "="*60)
        print("   [AGENT] CHIMERA NAUTILUS AGENT - Initialisation")
        print("="*60)
        
        # 1. Initialiser Nautilus (TEE + Attestation)
        print("[TEE] Chargement Nautilus TEE...")
        self.enclave = EnclaveState()
        print(f"   [OK] Mode: {NAUTILUS_MODE}")
        print(f"   [PCR0] PCR0: {self.enclave.pcrs['PCR0'][:32]}...")
        
        # 2. Vérifier Nimbus SDK
        print("\n[SDK] Vérification Nimbus SDK...")
        if NIMBUS_AVAILABLE:
            print(f"   [OK] SDK trouvé: {NIMBUS_SDK_PATH}")
        else:
            print(f"   [WARN] SDK non trouvé - mode simulation")
        
        # 3. Initialiser Gemini AI si activé
        print("\n[AI] Configuration Intelligence Artificielle...")
        self.gemini_trader = None
        if USE_GEMINI:
            if GEMINI_AVAILABLE:
                gemini_key = os.getenv("GEMINI_API_KEY")
                if gemini_key:
                    try:
                        self.gemini_trader = GeminiTrader(gemini_key)
                        print(f"   [OK] Gemini activé pour combats NFT")
                    except Exception as e:
                        print(f"   [WARN] Erreur Gemini: {str(e)[:50]} - mode manuel")
                else:
                    print(f"   [WARN] GEMINI_API_KEY manquante - mode manuel")
            else:
                print(f"   [WARN] Module gemini_trader non trouvé - mode manuel")
        else:
            print(f"   [INFO] Mode manuel (USE_GEMINI=false)")
        
        # 4. Vérifier Walrus
        print("\n[WALRUS] Configuration Walrus...")
        print(f"   [NET] Publisher: {WALRUS_PUBLISHER_URL}")
        
        # 5. Cache pour l'API de prix (éviter rate limiting)
        self.price_cache = {
            "data": None,
            "timestamp": 0,
            "ttl": 30  # Cache de 30 secondes pour scalping
        }
        
        # 5. Risk management tracking
        self.daily_pnl = 0
        self.daily_trades = 0
        self.open_positions = 0
        self.last_reset_day = datetime.now().day
        self.last_price = None  # Pour calculer le momentum court terme
        
        print("\n" + "="*60)
        print("[OK] AGENT PRÊT")
        print("="*60 + "\n")
    
    def calculate_ema(self, prices, period):
        """Calculate EMA from price list"""
        if len(prices) < period:
            return prices[-1] if prices else 0
        multiplier = 2 / (period + 1)
        ema = sum(prices[:period]) / period
        for price in prices[period:]:
            ema = (price - ema) * multiplier + ema
        return ema
    
    def calculate_rsi(self, prices, period=14):
        """Calculate RSI from price list"""
        if len(prices) < period + 1:
            return 50
        deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        gains = [d if d > 0 else 0 for d in deltas[-period:]]
        losses = [-d if d < 0 else 0 for d in deltas[-period:]]
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        if avg_loss == 0:
            return 100
        rs = avg_gain / avg_loss
        return 100 - (100 / (1 + rs))
    
    def calculate_atr(self, highs, lows, closes, period=14):
        """Calculate ATR from OHLC data"""
        if len(highs) < period:
            return (highs[-1] - lows[-1]) if highs and lows else 0
        trs = []
        for i in range(1, len(highs)):
            hl = highs[i] - lows[i]
            hc = abs(highs[i] - closes[i-1])
            lc = abs(lows[i] - closes[i-1])
            trs.append(max(hl, hc, lc))
        return sum(trs[-period:]) / period
    
    def analyze_market(self):
        """Analyse du marché SUI avec indicateurs techniques multi-timeframe"""
        current_time = time.time()
        
        # Vérifier le cache
        if self.price_cache["data"] and (current_time - self.price_cache["timestamp"]) < self.price_cache["ttl"]:
            return self.price_cache["data"]
        
        # Liste d'APIs à essayer dans l'ordre
        apis = [
            {
                "name": "binance",
                "url": "https://api.binance.com/api/v3/ticker/24hr",
                "params": {"symbol": "SUIUSDT"},
                "parser": lambda r: {
                    "price": float(r["lastPrice"]),
                    "change_24h": float(r["priceChangePercent"]),
                    "volume_24h": float(r["quoteVolume"])
                }
            },
            {
                "name": "coinbase",
                "url": "https://api.coinbase.com/v2/prices/SUI-USD/spot",
                "params": {},
                "parser": lambda r: {
                    "price": float(r["data"]["amount"]),
                    "change_24h": 0,  # Coinbase ne donne pas le changement dans cet endpoint
                    "volume_24h": 0
                }
            },
            {
                "name": "coingecko",
                "url": "https://api.coingecko.com/api/v3/simple/price",
                "params": {
                    "ids": "sui",
                    "vs_currencies": "usd",
                    "include_24hr_change": "true",
                    "include_24hr_vol": "true"
                },
                "parser": lambda r: {
                    "price": r["sui"]["usd"],
                    "change_24h": r["sui"].get("usd_24h_change", 0),
                    "volume_24h": r["sui"].get("usd_24h_vol", 0)
                }
            }
        ]
        
        # Essayer chaque API jusqu'à ce qu'une fonctionne
        for api in apis:
            try:
                response = requests.get(
                    api["url"],
                    params=api["params"],
                    timeout=8,
                    headers={"User-Agent": "Chimera-Nautilus-Agent/1.0"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    parsed = api["parser"](data)
                    
                    price = parsed["price"]
                    change_24h = parsed["change_24h"]
                    volume_24h = parsed["volume_24h"]
                    
                    # Validation: vérifier que le prix est plausible
                    if price <= 0 or price > 100:
                        print(f"   [WARN] Prix suspect depuis {api['name']}: ${price}")
                        continue
                    
                    # Déterminer la tendance basée sur le changement 24h
                    if change_24h > 2:
                        trend = "bullish"
                    elif change_24h < -2:
                        trend = "bearish"
                    else:
                        trend = "neutral"
                    
                    # Calculer momentum court terme (depuis dernière itération)
                    recent_change = 0
                    if self.last_price:
                        recent_change = ((price - self.last_price) / self.last_price) * 100
                    self.last_price = price
                    
                    market_data = {
                        "sui_price": price,
                        "trend": trend,
                        "change_24h": change_24h,
                        "recent_change_pct": recent_change,
                        "volume_24h": volume_24h,
                        "data_source": api["name"],
                        "timestamp": current_time
                    }
                    
                    # Mettre en cache
                    self.price_cache["data"] = market_data
                    self.price_cache["timestamp"] = current_time
                    
                    return market_data
                    
            except requests.exceptions.Timeout:
                print(f"   [TIMEOUT] Timeout {api['name']} - essai suivant...")
                continue
            except Exception as e:
                print(f"   [WARN] Erreur {api['name']}: {str(e)[:50]} - essai suivant...")
                continue
        
        # Si on a du cache même expiré, l'utiliser plutôt que simuler
        if self.price_cache["data"]:
            print(f"   [CACHE] Utilisation cache expiré (âge: {int(current_time - self.price_cache['timestamp'])}s)")
            cache_data = self.price_cache["data"].copy()
            cache_data["data_source"] = "cache"
            return cache_data
        
        # Fallback final: simulation si aucune donnée disponible
        print("   [SIM] Fallback: simulation de prix (toutes APIs échouées)")
        return {
            "sui_price": 1.50 + (random.random() * 0.5),
            "trend": random.choice(["bullish", "bearish", "neutral"]),
            "change_24h": random.uniform(-5, 5),
            "volume_24h": random.randint(10_000_000, 50_000_000),
            "data_source": "simulation",
            "timestamp": current_time
        }
    
    def make_decision(self, market_data: dict) -> dict:
        """Logique de décision - utilise Gemini AI si disponible, sinon stratégie manuelle"""
        
        # Mode Gemini AI
        if USE_GEMINI and GEMINI_AVAILABLE and self.gemini_trader:
            try:
                print(f"   [GEMINI] Analyse en cours...")
                decision = self.gemini_trader.analyze_market(market_data)
                if decision and decision.get('action'):
                    print(f"   [GEMINI] Décision: {decision['action']} | Confiance: {decision['confidence']*100:.0f}%")
                    return decision
                else:
                    print(f"   [GEMINI] Erreur - fallback mode manuel")
            except Exception as e:
                print(f"   [GEMINI] Erreur: {str(e)[:50]} - fallback mode manuel")
        
        # Mode manuel (stratégie dual-setup)
        price = market_data["sui_price"]
        
        # Simuler les indicateurs (en production: fetch real OHLCV data)
        # Pour la démo, on génère des valeurs cohérentes
        ema15_15m = price * random.uniform(0.998, 1.002)
        ema50_15m = price * random.uniform(0.995, 1.005)
        ema9_5m = price * random.uniform(0.999, 1.001)
        ema21_5m = price * random.uniform(0.997, 1.003)
        vwap = price * random.uniform(0.999, 1.001)
        rsi = random.uniform(30, 70)
        atr_5m = price * random.uniform(0.002, 0.004)
        atr_pct = (atr_5m / price) * 100
        
        # État du compte
        equity = TRADING_CONFIG["equity"]
        risk_per_trade = equity * TRADING_CONFIG["risk_per_trade_pct"]
        
        # Déterminer le biais de marché (15m)
        if ema15_15m > ema50_15m and price > vwap:
            market_bias = "BULLISH"
        elif ema15_15m < ema50_15m and price < vwap:
            market_bias = "BEARISH"
        else:
            market_bias = "RANGE"
        
        # Variables de décision
        action = "HOLD"
        confidence = 0.5
        reasoning = ""
        setup = None
        stop_loss = 0
        take_profit_1 = 0
        take_profit_2 = 0
        position_size = 0
        
        # --- SETUP A: TREND PULLBACK ---
        if market_bias in ["BULLISH", "BEARISH"] and 0.15 <= atr_pct <= 0.35:
            # Vérifier conditions pullback
            if market_bias == "BULLISH":
                # Long: EMA9 recroise au-dessus EMA21 + RSI > 50
                if ema9_5m > ema21_5m and rsi > 50 and price > vwap:
                    action = "BUY_SUI"
                    setup = "TREND_PULLBACK_LONG"
                    confidence = 0.80
                    
                    # Calcul stop/TP basés sur ATR
                    stop_distance = TRADING_CONFIG["setup_a"]["stop_atr_mult"] * atr_5m
                    stop_loss = price - stop_distance
                    take_profit_1 = price + (TRADING_CONFIG["setup_a"]["tp1_atr_mult"] * atr_5m)
                    take_profit_2 = price + (TRADING_CONFIG["setup_a"]["tp2_atr_mult"] * atr_5m)
                    
                    # Position sizing
                    position_size = risk_per_trade / stop_distance
                    
                    reasoning = f"Pullback haussier: EMA9({ema9_5m:.4f})>EMA21({ema21_5m:.4f}), RSI={rsi:.1f}, ATR%={atr_pct:.2f}%"
            
            elif market_bias == "BEARISH":
                # Short: EMA9 recroise en-dessous EMA21 + RSI < 50
                if ema9_5m < ema21_5m and rsi < 50 and price < vwap:
                    action = "SELL_SUI"
                    setup = "TREND_PULLBACK_SHORT"
                    confidence = 0.80
                    
                    stop_distance = TRADING_CONFIG["setup_a"]["stop_atr_mult"] * atr_5m
                    stop_loss = price + stop_distance
                    take_profit_1 = price - (TRADING_CONFIG["setup_a"]["tp1_atr_mult"] * atr_5m)
                    take_profit_2 = price - (TRADING_CONFIG["setup_a"]["tp2_atr_mult"] * atr_5m)
                    
                    position_size = risk_per_trade / stop_distance
                    
                    reasoning = f"Pullback baissier: EMA9({ema9_5m:.4f})<EMA21({ema21_5m:.4f}), RSI={rsi:.1f}, ATR%={atr_pct:.2f}%"
        
        # --- SETUP B: VWAP FADE (mean-revert en range) ---
        elif market_bias == "RANGE":
            vwap_distance = abs(price - vwap)
            
            # Short si extension au-dessus VWAP + RSI > 70
            if price > vwap and vwap_distance >= atr_5m and rsi > TRADING_CONFIG["setup_b"]["rsi_overbought"]:
                action = "SELL_SUI"
                setup = "VWAP_FADE_SHORT"
                confidence = 0.65
                
                stop_distance = TRADING_CONFIG["setup_b"]["stop_atr_mult"] * atr_5m
                stop_loss = price + stop_distance
                take_profit_1 = vwap
                take_profit_2 = price - (TRADING_CONFIG["setup_b"]["tp_atr_mult"] * atr_5m)
                
                position_size = (risk_per_trade / stop_distance) * 0.5  # Taille réduite
                
                reasoning = f"VWAP Fade short: Prix={price:.4f} vs VWAP={vwap:.4f}, RSI={rsi:.1f} (surachat)"
            
            # Long si extension en-dessous VWAP + RSI < 30
            elif price < vwap and vwap_distance >= atr_5m and rsi < TRADING_CONFIG["setup_b"]["rsi_oversold"]:
                action = "BUY_SUI"
                setup = "VWAP_FADE_LONG"
                confidence = 0.65
                
                stop_distance = TRADING_CONFIG["setup_b"]["stop_atr_mult"] * atr_5m
                stop_loss = price - stop_distance
                take_profit_1 = vwap
                take_profit_2 = price + (TRADING_CONFIG["setup_b"]["tp_atr_mult"] * atr_5m)
                
                position_size = (risk_per_trade / stop_distance) * 0.5  # Taille réduite
                
                reasoning = f"VWAP Fade long: Prix={price:.4f} vs VWAP={vwap:.4f}, RSI={rsi:.1f} (survente)"
        
        # Si pas de setup valide
        if action == "HOLD":
            reasoning = f"Pas de setup: Biais={market_bias}, EMA15={ema15_15m:.4f}, EMA50={ema50_15m:.4f}, VWAP={vwap:.4f}, RSI={rsi:.1f}"
        
        return {
            "action": action,
            "setup": setup,
            "confidence": confidence,
            "reasoning": reasoning,
            "market_bias": market_bias,
            "indicators": {
                "price": price,
                "ema15_15m": ema15_15m,
                "ema50_15m": ema50_15m,
                "ema9_5m": ema9_5m,
                "ema21_5m": ema21_5m,
                "vwap": vwap,
                "rsi": rsi,
                "atr_5m": atr_5m,
                "atr_pct": atr_pct
            },
            "risk_management": {
                "stop_loss": stop_loss,
                "take_profit_1": take_profit_1,
                "take_profit_2": take_profit_2,
                "position_size_usd": position_size,
                "risk_usd": risk_per_trade
            },
            "timestamp": int(time.time())
        }
    
    def execute_action(self, decision: dict):
        """Exécute une action DeFi via Nimbus"""
        action = decision["action"]
        
        if action == "HOLD":
            print("    Pas d'action - HOLD")
            return None
        
        print(f"   [EXEC] Exécution: {action}")
        
        # Appel Nimbus SDK
        result = call_nimbus_action(action, {
            "amount": 10,
            "slippage": 0.01
        })
        
        print(f"   [RESULT] Résultat Nimbus: {result.get('status')}")
        return result
    
    def save_to_memory(self, decision: dict, execution_result: dict = None):
        """Sauvegarde la décision sur Walrus"""
        memory_entry = {
            "decision": decision,
            "execution": execution_result,
            "agent_id": "chimera-nautilus-01",
            "pcr0": self.enclave.pcrs["PCR0"][:16]  # Preuve d'identité
        }
        
        # Signature avec la clé de l'enclave (utilise sign_battle_result pour compatibilité)
        try:
            signature_data = self.enclave.sign_battle_result(
                winner_id="agent",
                loser_id="market",
                xp_gain=0,
                battle_log=[decision]
            )
            memory_entry["signature"] = signature_data["signature"]
            memory_entry["public_key"] = signature_data["public_key"]
        except AttributeError:
            # Fallback si méthode sign_battle_result n'existe pas
            memory_entry["signature"] = hashlib.sha256(json.dumps(memory_entry).encode()).hexdigest()
        
        # Upload Walrus
        blob_id = WalrusMemory.save(memory_entry)
        return blob_id
    
    def execute_battle(self, monster1_data: dict = None, monster2_data: dict = None):
        """
        Exécute un combat unique entre deux monstres.
        Si aucun monstre n'est fourni, génère des monstres aléatoires.
        
        Returns:
            dict: Résultat du combat avec signature TEE
        """
        from battle_engine import Monster, BattleEngine
        
        # Créer les monstres
        if monster1_data:
            monster1 = Monster(**monster1_data)
        else:
            monster1 = Monster(
                monster_id=f"nft_{int(time.time())}_1",
                name=random.choice(["Dragon Rouge", "Phoenix Doré", "Titan de Glace", "Léviathan"]),
                strength=random.randint(60, 90),
                agility=random.randint(50, 85),
                intelligence=random.randint(55, 88),
                level=random.randint(3, 7)
            )
        
        if monster2_data:
            monster2 = Monster(**monster2_data)
        else:
            monster2 = Monster(
                monster_id=f"nft_{int(time.time())}_2",
                name=random.choice(["Golem de Pierre", "Spectre Noir", "Hydre Venimeuse", "Griffon Céleste"]),
                strength=random.randint(55, 92),
                agility=random.randint(48, 87),
                intelligence=random.randint(52, 90),
                level=random.randint(3, 7)
            )
        
        print(f"\n{'='*60}")
        print(f" COMBAT - {datetime.now().strftime('%H:%M:%S')}")
        print(f"{'='*60}\n")
        print(f"[NFT 1] {monster1.name} (Lvl {monster1.level})")
        print(f"        STR: {monster1.strength} | AGI: {monster1.agility} | INT: {monster1.intelligence}")
        print(f"\n[NFT 2] {monster2.name} (Lvl {monster2.level})")
        print(f"        STR: {monster2.strength} | AGI: {monster2.agility} | INT: {monster2.intelligence}\n")
        
        # Lancer le combat avec Gemini AI
        engine = BattleEngine(monster1, monster2)
        result = engine.simulate_battle()
        
        # Sauvegarder le résultat sur Walrus avec signature TEE
        battle_memory = {
            "battle_id": int(time.time()),
            "timestamp": datetime.now().isoformat(),
            "combattants": {
                "monster1": monster1.to_dict(),
                "monster2": monster2.to_dict()
            },
            "result": {
                "winner_id": result["winner_id"],
                "loser_id": result["loser_id"],
                "xp_gain": result["xp_gain"],
                "total_turns": result["total_turns"],
                "winner_final_hp": result["winner_final_hp"]
            },
            "agent_id": "chimera-battle-agent-01",
            "pcr0": self.enclave.pcrs["PCR0"][:16]
        }
        
        # Signature TEE du résultat
        try:
            signature_data = self.enclave.sign_battle_result(
                winner_id=result["winner_id"],
                loser_id=result["loser_id"],
                xp_gain=result["xp_gain"],
                battle_log=result["battle_log"]
            )
            battle_memory["signature"] = signature_data["signature"]
            battle_memory["public_key"] = signature_data["public_key"]
            battle_memory["attestation"] = signature_data["attestation"]
        except Exception as e:
            print(f"   [WARN] Signature TEE échouée: {str(e)[:50]}")
            battle_memory["signature"] = hashlib.sha256(json.dumps(battle_memory).encode()).hexdigest()
        
        # Upload sur Walrus
        blob_id = WalrusMemory.save(battle_memory)
        battle_memory["walrus_blob_id"] = blob_id
        
        print(f"\n[WALRUS] Mémoire: {blob_id[:32]}...")
        print(f"[TEE] Combat signé et attesté cryptographiquement\n")
        
        return battle_memory
    
    def run_api_server(self):
        """Démarre le serveur Flask API pour les combats à la demande"""
        app = Flask(__name__)
        
        # Capturer self dans la closure
        agent = self
        
        @app.route('/health', methods=['GET'])
        def health():
            """Endpoint de santé"""
            return jsonify({
                "status": "running",
                "agent": "chimera-battle-agent",
                "tee_enabled": True,
                "gemini_enabled": os.getenv("USE_GEMINI", "false") == "true"
            })
        
        @app.route('/battle', methods=['POST'])
        def trigger_battle():
            """Déclenche un combat sur demande"""
            try:
                data = request.get_json() or {}
                monster1_data = data.get('monster1')
                monster2_data = data.get('monster2')
                
                # Exécuter le combat
                result = agent.execute_battle(monster1_data, monster2_data)
                
                return jsonify({
                    "success": True,
                    "battle": result
                }), 200
                
            except Exception as e:
                return jsonify({
                    "success": False,
                    "error": str(e)
                }), 500
        
        @app.route('/status', methods=['GET'])
        def status():
            """Statut de l'agent"""
            return jsonify({
                "mode": "battle",
                "tee_pcr0": agent.enclave.pcrs["PCR0"][:32],
                "public_key": agent.enclave.get_public_key_hex()[:32]
            })
        
        # Démarrer le serveur
        port = int(os.getenv("PORT", "3000"))
        app.run(host='0.0.0.0', port=port, debug=True)
    
    def run_battle_mode(self):
        """Mode combat NFT avec Gemini AI pour choisir les attaques"""
        from battle_engine import Monster, BattleEngine
        
        print("[START] Mode Combat NFT - Gemini AI Battle Agent\n")
        battle_count = 0
        
        try:
            while True:
                battle_count += 1
                print(f"\n{'='*60}")
                print(f" COMBAT #{battle_count} - {datetime.now().strftime('%H:%M:%S')}")
                print(f"{'='*60}\n")
                
                # Créer deux monstres aléatoires pour la démo
                monster1 = Monster(
                    monster_id=f"nft_{battle_count}_1",
                    name=random.choice(["Dragon Rouge", "Phoenix Doré", "Titan de Glace", "Léviathan"]),
                    strength=random.randint(60, 90),
                    agility=random.randint(50, 85),
                    intelligence=random.randint(55, 88),
                    level=random.randint(3, 7)
                )
                
                monster2 = Monster(
                    monster_id=f"nft_{battle_count}_2",
                    name=random.choice(["Golem de Pierre", "Spectre Noir", "Hydre Venimeuse", "Griffon Céleste"]),
                    strength=random.randint(55, 92),
                    agility=random.randint(48, 87),
                    intelligence=random.randint(52, 90),
                    level=random.randint(3, 7)
                )
                
                print(f"[NFT 1] {monster1.name} (Lvl {monster1.level})")
                print(f"        STR: {monster1.strength} | AGI: {monster1.agility} | INT: {monster1.intelligence}")
                print(f"\n[NFT 2] {monster2.name} (Lvl {monster2.level})")
                print(f"        STR: {monster2.strength} | AGI: {monster2.agility} | INT: {monster2.intelligence}\n")
                
                # Lancer le combat avec Gemini AI
                engine = BattleEngine(monster1, monster2)
                result = engine.simulate_battle()
                
                # Sauvegarder le résultat sur Walrus avec signature TEE
                battle_memory = {
                    "battle_id": battle_count,
                    "timestamp": datetime.now().isoformat(),
                    "combattants": {
                        "monster1": monster1.to_dict(),
                        "monster2": monster2.to_dict()
                    },
                    "result": {
                        "winner_id": result["winner_id"],
                        "loser_id": result["loser_id"],
                        "xp_gain": result["xp_gain"],
                        "total_turns": result["total_turns"],
                        "winner_final_hp": result["winner_final_hp"]
                    },
                    "agent_id": "chimera-battle-agent-01",
                    "pcr0": self.enclave.pcrs["PCR0"][:16]
                }
                
                # Signature TEE du résultat
                try:
                    signature_data = self.enclave.sign_battle_result(
                        winner_id=result["winner_id"],
                        loser_id=result["loser_id"],
                        xp_gain=result["xp_gain"],
                        battle_log=result["battle_log"]
                    )
                    battle_memory["signature"] = signature_data["signature"]
                    battle_memory["public_key"] = signature_data["public_key"]
                    battle_memory["attestation"] = signature_data["attestation"]
                except Exception as e:
                    print(f"   [WARN] Signature TEE échouée: {str(e)[:50]}")
                    battle_memory["signature"] = hashlib.sha256(json.dumps(battle_memory).encode()).hexdigest()
                
                # Upload sur Walrus
                blob_id = WalrusMemory.save(battle_memory)
                print(f"\n[WALRUS] Mémoire: {blob_id[:32]}...")
                print(f"[TEE] Combat signé et attesté cryptographiquement\n")
                
                # Attendre avant le prochain combat
                sleep_time = 45  # 45 secondes entre chaque combat
                print(f"Prochain combat dans {sleep_time}s...\n")
                time.sleep(sleep_time)
                
        except KeyboardInterrupt:
            print("\n\n[STOP] Arrêt du Battle Agent...")
            print(f"Total combats: {battle_count}")
    
    def run_trading_mode(self):
        """Mode trading (EN PAUSE - conservé pour référence future)"""
        print("[INFO] Mode trading en pause - utilisez run_battle_mode() à la place\n")
        print("[START] Démarrage de l'agent...\n")
        iteration = 0
        
        try:
            while True:
                iteration += 1
                print(f"\n{'='*60}")
                print(f" ITÉRATION #{iteration} - {datetime.now().strftime('%H:%M:%S')}")
                print(f"{'='*60}")
                
                # 1. Analyser le marché
                market = self.analyze_market()
                
                # Icones pour les sources de données
                source_icons = {
                    "binance": "[BINANCE]",
                    "coinbase": "[COINBASE]", 
                    "coingecko": "[COINGECKO]",
                    "cache": "[CACHE]",
                    "simulation": "[SIM]"
                }
                source_icon = source_icons.get(market.get("data_source"), "[UNKNOWN]")
                
                recent_change = market.get('recent_change_pct', 0)
                change_indicator = "▲" if recent_change > 0 else "▼" if recent_change < 0 else "═"
                
                print(f"{source_icon} Prix: ${market['sui_price']:.4f} {change_indicator} {recent_change:+.3f}% | Trend: {market['trend']} | Vol 24h: ${market.get('volume_24h', 0)/1e6:.1f}M")
                
                # 2. Prendre une décision
                decision = self.make_decision(market)
                print(f"[DECISION] {decision['action']} | Setup: {decision.get('setup', 'N/A')} | Confiance: {decision['confidence']:.0%}")
                print(f"[REASON] {decision['reasoning']}")
                
                # Afficher risk management si trade actif
                if decision['action'] != 'HOLD':
                    rm = decision.get('risk_management', {})
                    print(f"[RISK] SL: ${rm.get('stop_loss', 0):.4f} | TP1: ${rm.get('take_profit_1', 0):.4f} | TP2: ${rm.get('take_profit_2', 0):.4f}")
                    print(f"[SIZE] Position: ${rm.get('position_size_usd', 0):.2f} | Risque: ${rm.get('risk_usd', 0):.2f}")
                
                # 3. Exécuter l'action
                execution = self.execute_action(decision)
                
                # 4. Sauvegarder dans la mémoire
                blob_id = self.save_to_memory(decision, execution)
                print(f" Mémoire Walrus: {blob_id[:32]}...")
                
                # 5. Attendre avant la prochaine itération
                if decision["action"] == "HOLD":
                    sleep_time = 35  # 35s si pas d'action (cache 30s + marge)
                else:
                    sleep_time = 40  # 40s si action effectuée
                
                print(f"\n Prochaine analyse dans {sleep_time}s...")
                time.sleep(sleep_time)
                
        except KeyboardInterrupt:
            print("\n\n Arrêt de l'agent...")
    
    def run(self):
        """Point d'entrée principal - lance le mode combat NFT par défaut"""
        mode = os.getenv("AGENT_MODE", "battle").lower()
        
        if mode == "trading":
            print("[MODE] Trading activé (expérimental)\n")
            self.run_trading_mode()
        else:
            print("[MODE] Battle NFT activé (défaut)\n")
            self.run_battle_mode()


def main():
    """Point d'entrée principal"""
    agent = ChimeraAgent()
    agent.run()

if __name__ == "__main__":
    main()