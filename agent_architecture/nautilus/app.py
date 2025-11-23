#!/usr/bin/env python3
"""
CHIMERA NAUTILUS AGENT - Phase 2
=================================
Agent DeFi autonome tournant dans Nautilus TEE avec:
- Vraie attestation (simulée localement, réelle sur AWS)
- Intégration Walrus pour mémoire immuable
- SDK Nimbus via subprocess (TypeScript bridge)
- Signature cryptographique de toutes les décisions
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

# Import du Hello World Nautilus
try:
    from hello_nautilus import EnclaveState, MockNSM
    NAUTILUS_MODE = "PRODUCTION (avec attestation)"
except ImportError:
    # Fallback si hello_nautilus.py n'est pas disponible
    NAUTILUS_MODE = "SIMULATION SIMPLE"
    class EnclaveState:
        def __init__(self):
            self.pcrs = {"PCR0": "simulated", "PCR1": "simulated", "PCR2": "simulated"}
        def sign_message(self, msg):
            return hashlib.sha256(json.dumps(msg).encode()).hexdigest()

# --- CONFIGURATION ---
SYSTEM_PROMPT = """
AGENT: CHIMERA-NAUTILUS-01
MISSION: Scalping SUI avec stratégie EMA/VWAP multi-timeframe
STRATÉGIE: 
  - Setup A: Trend Pullback (EMA15>50 + pullback EMA9/21)
  - Setup B: VWAP Fade (mean-revert en range)
  - Risk: 1-2% par trade, max 2%/jour
  - Indicateurs: EMA(9,15,21,50), VWAP, RSI(14), ATR(14), Volume
MÉMOIRE: Stockage immuable sur Walrus
IDENTITÉ: Vérifiable via attestation Nautilus
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

# --- INTÉGRATION NIMBUS (TypeScript SDK Bridge via HTTP) ---
NIMBUS_BRIDGE_URL = os.getenv("NIMBUS_BRIDGE_URL", "http://localhost:3001")

def check_nimbus_bridge() -> bool:
    """Vérifie si le bridge Nimbus est disponible"""
    try:
        response = requests.get(f"{NIMBUS_BRIDGE_URL}/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            return data.get("agent_ready", False)
    except:
        pass
    return False

NIMBUS_AVAILABLE = check_nimbus_bridge()

def call_nimbus_action(action: str, params: dict) -> dict:
    """
    Appelle le SDK Nimbus TypeScript via HTTP Bridge
    Le bridge expose le Nimbus SDK sur http://localhost:3001
    """
    if not NIMBUS_AVAILABLE:
        print("   [WARN] Nimbus Bridge non disponible - mode simulation")
        return {"status": "simulated", "action": action, "params": params}
    
    try:
        response = requests.post(
            f"{NIMBUS_BRIDGE_URL}/execute",
            json={"action": action, "params": params},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"   [NIMBUS] ✅ {action} executed on-chain")
            return result
        else:
            error_data = response.json()
            print(f"   [NIMBUS] ❌ Error: {error_data.get('error', 'Unknown error')}")
            return {"status": "error", "error": error_data.get("error")}
            
    except requests.exceptions.Timeout:
        print(f"   [NIMBUS] ⏱️  Timeout - transaction may still be processing")
        return {"status": "timeout", "action": action}
    except Exception as e:
        print(f"   [NIMBUS] ❌ Exception: {str(e)}")
        return {"status": "error", "error": str(e)}

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
        print("\n[SDK] Vérification Nimbus Bridge...")
        if NIMBUS_AVAILABLE:
            print(f"   [OK] Bridge connecté: {NIMBUS_BRIDGE_URL}")
        else:
            print(f"   [WARN] Bridge non disponible - mode simulation")
        
        # 3. Vérifier Walrus
        print("\n[WALRUS] Configuration Walrus...")
        print(f"   [NET] Publisher: {WALRUS_PUBLISHER_URL}")
        
        # 4. Cache pour l'API de prix (éviter rate limiting)
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
        """Logique de décision avec stratégie scalping dual-setup"""
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
        
        # Signature avec la clé de l'enclave
        signature = self.enclave.sign_message(memory_entry)
        memory_entry["signature"] = signature
        
        # Upload Walrus
        blob_id = WalrusMemory.save(memory_entry)
        return blob_id
    
    def run(self):
        """Boucle principale de l'agent"""
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


def main():
    """Point d'entrée principal"""
    agent = ChimeraAgent()
    agent.run()

if __name__ == "__main__":
    main()