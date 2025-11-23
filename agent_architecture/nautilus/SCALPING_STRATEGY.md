# Stratégie de Scalping SUI - Agent Chimera Nautilus

## Vue d'ensemble

Agent de trading autonome implémentant une stratégie de scalping dual-setup sur SUI avec analyse multi-timeframe et gestion stricte du risque.

## Configuration

### Risque

- **Risque par trade**: 1.5%
- **Perte journalière max**: 2%
- **Positions simultanées max**: 2
- **Levier**: 3x

### Timeframes

- **15 min (Biais)**: Détermination de la direction du marché
- **5 min (Entrée)**: Signaux d'entrée précis

## Indicateurs Techniques

### UT 15 min (Biais de marché)

- **EMA 15 & EMA 50**: Direction et qualité de tendance
- **VWAP de session**: Aimant de prix / moyenne journalière
- **ATR(14)**: Volatilité (normal: 0.15-0.35%)

### UT 5 min (Déclencheurs)

- **EMA 9 & EMA 21**: Signaux fins d'entrée
- **RSI(14)**: Évite extensions extrêmes
- **Volume (SMA 20)**: Confirmation momentum
- **ATR(14)**: Dimensionnement stops/TP

## Conditions de Marché (Filtre 15m)

### Biais Haussier

- EMA15 > EMA50
- Prix au-dessus du VWAP
- → Chercher setups LONG uniquement

### Biais Baissier

- EMA15 < EMA50
- Prix au-dessous du VWAP
- → Chercher setups SHORT uniquement

### Range (Mean-Revert)

- EMA15 ≈ EMA50 (plats)
- Prix oscille autour du VWAP
- → Setup B uniquement (VWAP Fade)

## Setup A - "Trend Pullback" (Continuation)

**Contexte**: Tendance claire (15m) + ATR% normal (0.15-0.35%)

### Entrée LONG

1. **Pullback**: Prix revient vers EMA21 (5m) sans casser structure 15m
2. **Déclencheur**:
   - EMA9(5m) > EMA21(5m) (recroisement)
   - Bougie clôture au-dessus EMA9
   - RSI(14) > 50
   - Prix au-dessus VWAP
3. **Exécution**: Limit Post-Only (maker) sous clôture signal
4. **Stop Loss**: Dernier swing low - 0.4× ATR(5m)
5. **Take Profit**:
   - TP1: +1.0× ATR(5m) → 40% position (RO+PO)
   - TP2: +1.5× ATR(5m) → 40% position (RO+PO)
   - Reste 20%: Sortie taker si momentum faiblit

### Entrée SHORT (symétrique)

- EMA9(5m) < EMA21(5m)
- RSI(14) < 50
- Prix sous VWAP
- Stops/TP inversés

### Invalidations

- Bougie signal > 1.2× ATR(5m) → Trop étirée, attendre retest
- Prix repasse sous/sur VWAP rapidement → Annuler

## Setup B - "VWAP Fade" (Mean-Revert)

**Contexte**: Range (EMA15 ~ EMA50) + Prix ~ VWAP

### Entrée SHORT (extension haute)

1. Prix s'écarte ≥ 1.0× ATR(5m) AU-DESSUS du VWAP
2. RSI(14) > 70 (surachat)
3. Volume en baisse sur dernière jambe
4. **Entrée**: Maker au retour vers VWAP (pas au pic!)
5. **Stop**: 0.5× ATR(5m) derrière extension
6. **TP unique**: VWAP ou 0.9× ATR(5m)

### Entrée LONG (extension basse)

1. Prix ≥ 1.0× ATR(5m) EN-DESSOUS du VWAP
2. RSI(14) < 30 (survente)
3. Volume décroissant
4. Entrée/Stop/TP symétriques

⚠️ **Taille réduite**: 50% de la position Setup A (plus risqué)

## Money Management

### Position Sizing

```
Taille = Risque$ / Distance_Stop$
```

**Exemple**:

- Risque: 1,5%
- Stop distance: 0.005 SUI (0.4× ATR)
- Taille position: 30 / 0.005 = 6000 SUI
- Avec levier 3x: 18000 SUI d'exposition

### Circuit Breakers

- **Max perte journalière**: -2% → STOP TRADING pour la journée
- **Max positions**: 2 simultanées
- **Taille Setup B**: 50% de Setup A

## Implémentation Technique

### Code: `app.py`

```python
TRADING_CONFIG = {
    "equity": 2000,
    "risk_per_trade_pct": 0.015,
    "max_daily_loss_pct": 0.02,
    "max_positions": 2,
    # ...
}
```

### Fonctions principales

- `calculate_ema()`: Calcul EMA
- `calculate_rsi()`: RSI from price list
- `calculate_atr()`: ATR from OHLC
- `make_decision()`: Logique dual-setup
- `execute_action()`: Exécution via Nimbus SDK

### Output Logs

```
[DECISION] BUY_SUI | Setup: TREND_PULLBACK_LONG | Confiance: 80%
[REASON] Pullback haussier: EMA9(1.3305)>EMA21(1.3295), RSI=62.3, ATR%=0.28%
[RISK] SL: $1.3250 | TP1: $1.3350 | TP2: $1.3400
[SIZE] Position: $6842.11 | Risque: $30.00
```

## Avantages de la Stratégie

1. **Dual-setup**: S'adapte aux conditions (trend/range)
2. **Multi-timeframe**: Réduit faux signaux
3. **ATR-based**: Stops/TP s'adaptent à la volatilité
4. **Risk-first**: Position sizing strict
5. **Mean-revert backup**: Génère trades même en range
6. **Nimbus integration**: Exécution on-chain vérifiable
7. **TEE attestation**: Décisions cryptographiquement prouvées

## Prochaines Évolutions

- [ ] Fetch OHLCV réel (Binance/Bybit WebSocket)
- [ ] Calcul indicateurs sur vraies données historiques
- [ ] Tracking PnL réel avec base de données
- [ ] Alertes Telegram/Discord sur setups
- [ ] Backtesting sur données historiques
- [ ] Optimisation paramètres (ML?)

---

**Auteur**: Chimera Nautilus Agent
**Version**: 1.0.0
**Date**: 22 novembre 2025
**Framework**: Nautilus TEE + Nimbus SDK
