#!/usr/bin/env python3
"""
Gemini AI Integration for Nautilus Agent
Utilise Google Gemini pour analyser le marché et prendre des décisions de trading
"""

import os
import json
import time
from typing import Dict, Any
import google.generativeai as genai

class GeminiTrader:
    """
    Agent de trading utilisant Gemini AI pour l'analyse et la prise de décision
    """
    
    def __init__(self, api_key: str = None):
        """
        Initialise Gemini AI
        
        Args:
            api_key: Clé API Google Gemini (ou depuis GEMINI_API_KEY env var)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY manquant. Configurez-le dans .env")
        
        genai.configure(api_key=self.api_key)
        
        # Utiliser gemini-2.0-flash-exp (modèle gratuit et performant)
        # ou gemini-3-pro-preview pour Gemini 3 (payant)
        try:
            # Essayer d'abord le modèle expérimental gratuit
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
            print("[GEMINI] ✅ Modèle Gemini 2.0 Flash Experimental initialisé")
        except Exception as e1:
            try:
                # Fallback vers gemini-1.5-pro (stable)
                self.model = genai.GenerativeModel('gemini-1.5-pro')
                print("[GEMINI] ✅ Modèle Gemini 1.5 Pro initialisé")
            except Exception as e2:
                # Dernier fallback : gemini-pro (ancien mais largement disponible)
                print(f"[GEMINI] ⚠️  Tentative fallback: {str(e2)[:50]}")
                self.model = genai.GenerativeModel('gemini-pro')
                print("[GEMINI] ✅ Modèle Gemini Pro initialisé")
    
    def analyze_market(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse le marché avec Gemini et retourne une décision de trading
        
        Args:
            market_data: Données de marché (prix, indicateurs, etc.)
            
        Returns:
            Décision structurée avec action, confiance, raisonnement
        """
        
        # Construire le prompt pour Gemini
        prompt = self._build_trading_prompt(market_data)
        
        try:
            # Appeler Gemini
            response = self.model.generate_content(prompt)
            
            # Parser la réponse
            decision = self._parse_gemini_response(response.text, market_data)
            
            print(f"[GEMINI] 🤖 Décision: {decision['action']} ({decision['confidence']:.0%})")
            
            return decision
            
        except Exception as e:
            print(f"[GEMINI] ❌ Erreur: {e}")
            # Fallback: décision conservative
            return {
                "action": "HOLD",
                "confidence": 0.5,
                "reasoning": f"Erreur Gemini: {str(e)}",
                "setup": None,
                "timestamp": int(time.time())
            }
    
    def _build_trading_prompt(self, market_data: Dict[str, Any]) -> str:
        """Construit un prompt structuré pour Gemini"""
        
        price = market_data.get("sui_price", 0)
        trend = market_data.get("trend", "neutral")
        change_24h = market_data.get("change_24h", 0)
        recent_change = market_data.get("recent_change_pct", 0)
        volume = market_data.get("volume_24h", 0)
        
        prompt = f"""Tu es un expert trader crypto spécialisé en scalping sur SUI.

DONNÉES DE MARCHÉ ACTUELLES:
- Prix SUI: ${price:.4f}
- Tendance 24h: {trend} ({change_24h:+.2f}%)
- Momentum court terme: {recent_change:+.3f}%
- Volume 24h: ${volume/1e6:.1f}M

STRATÉGIE DE SCALPING:
Tu utilises deux setups:

SETUP A - TREND PULLBACK (continuation):
- Contexte: Tendance claire + ATR normal (0.15-0.35%)
- LONG: Prix pullback vers support + RSI > 50 + momentum haussier
- SHORT: Prix pullback vers résistance + RSI < 50 + momentum baissier
- Stop: 0.4× ATR | TP1: 1.0× ATR | TP2: 1.5× ATR

SETUP B - VWAP FADE (mean-revert en range):
- Contexte: Marché en range, pas de tendance nette
- SHORT: Prix ≥ 1× ATR au-dessus moyenne + RSI > 70
- LONG: Prix ≥ 1× ATR en-dessous moyenne + RSI < 30
- Stop: 0.5× ATR | TP: retour à la moyenne

RISK MANAGEMENT:
- Risque par trade: 1.5% de l'equity (30 USDC sur 2000 USDC)
- Max positions: 2 simultanées
- Jamais trader sans setup clair

INSTRUCTIONS:
Analyse ces données et décide:
1. Quelle ACTION: BUY_SUI, SELL_SUI, ou HOLD
2. Quel SETUP: TREND_PULLBACK_LONG, TREND_PULLBACK_SHORT, VWAP_FADE_LONG, VWAP_FADE_SHORT, ou None
3. Niveau de CONFIANCE: 0-100%
4. RAISONNEMENT: Explication courte (1 phrase)

Réponds UNIQUEMENT en JSON strict (pas de markdown):
{{
  "action": "BUY_SUI|SELL_SUI|HOLD",
  "setup": "TREND_PULLBACK_LONG|...|None",
  "confidence": 0.XX,
  "reasoning": "ton explication ici"
}}
"""
        return prompt
    
    def _parse_gemini_response(self, response_text: str, market_data: Dict) -> Dict[str, Any]:
        """Parse la réponse JSON de Gemini"""
        
        import time
        
        try:
            # Nettoyer la réponse (enlever markdown si présent)
            clean_text = response_text.strip()
            if clean_text.startswith("```"):
                # Enlever les blocs markdown
                lines = clean_text.split("\n")
                clean_text = "\n".join([l for l in lines if not l.startswith("```")])
            
            # Parser JSON
            decision = json.loads(clean_text)
            
            # Valider et compléter
            action = decision.get("action", "HOLD")
            setup = decision.get("setup", None)
            confidence = float(decision.get("confidence", 0.5))
            reasoning = decision.get("reasoning", "Décision Gemini")
            
            # Simuler des indicateurs (en production: calculer réellement)
            price = market_data["sui_price"]
            atr_5m = price * 0.003  # ~0.3%
            
            # Calculer risk management basique
            risk_usd = 30.0  # 1.5% de 2000 USDC
            
            if action in ["BUY_SUI", "SELL_SUI"]:
                stop_distance = 0.4 * atr_5m
                position_size = risk_usd / stop_distance
                
                if action == "BUY_SUI":
                    stop_loss = price - stop_distance
                    tp1 = price + (1.0 * atr_5m)
                    tp2 = price + (1.5 * atr_5m)
                else:  # SELL
                    stop_loss = price + stop_distance
                    tp1 = price - (1.0 * atr_5m)
                    tp2 = price - (1.5 * atr_5m)
            else:
                stop_loss = 0
                tp1 = 0
                tp2 = 0
                position_size = 0
            
            return {
                "action": action,
                "setup": setup,
                "confidence": confidence,
                "reasoning": reasoning,
                "market_bias": market_data.get("trend", "neutral").upper(),
                "indicators": {
                    "price": price,
                    "atr_5m": atr_5m,
                    "atr_pct": (atr_5m / price) * 100
                },
                "risk_management": {
                    "stop_loss": stop_loss,
                    "take_profit_1": tp1,
                    "take_profit_2": tp2,
                    "position_size_usd": position_size,
                    "risk_usd": risk_usd
                },
                "timestamp": int(time.time())
            }
            
        except json.JSONDecodeError as e:
            print(f"[GEMINI] ⚠️  Erreur parsing JSON: {e}")
            print(f"[GEMINI] Réponse brute: {response_text[:200]}")
            
            # Fallback conservateur
            return {
                "action": "HOLD",
                "setup": None,
                "confidence": 0.5,
                "reasoning": "Impossible de parser la réponse Gemini",
                "timestamp": int(time.time())
            }


if __name__ == "__main__":
    """Test du module Gemini"""
    import time
    
    # Données de marché simulées
    test_market_data = {
        "sui_price": 1.3899,
        "trend": "bullish",
        "change_24h": 2.5,
        "recent_change_pct": 0.15,
        "volume_24h": 64_000_000
    }
    
    try:
        trader = GeminiTrader()
        decision = trader.analyze_market(test_market_data)
        
        print("\n" + "="*60)
        print("DÉCISION GEMINI:")
        print("="*60)
        print(json.dumps(decision, indent=2))
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        print("💡 Configurez GEMINI_API_KEY dans .env")
