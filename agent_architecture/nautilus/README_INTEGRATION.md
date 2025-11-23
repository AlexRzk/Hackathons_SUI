# Nautilus TEE Agent + Nimbus SDK Integration

Agent IA autonome tournant dans Nautilus TEE avec intégration réelle du Nimbus SDK pour exécuter des transactions on-chain sur SUI.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NAUTILUS TEE ENCLAVE                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Python Agent (app.py)                                 │ │
│  │  - Scalping strategy (EMA/VWAP/RSI/ATR)               │ │
│  │  - Market analysis (Binance/Coinbase/CoinGecko)       │ │
│  │  - Decision logic (Trend Pullback / VWAP Fade)        │ │
│  │  - TEE Attestation + Cryptographic signatures         │ │
│  └────────────────────────────────────────────────────────┘ │
│                          ↕ HTTP                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Nimbus Bridge (nimbus_bridge.ts)                     │ │
│  │  - TypeScript HTTP server (Express)                    │ │
│  │  - @getnimbus/sui-agent-kit integration                │ │
│  │  - Actions: trade, stake, unstake, transfer            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↕ RPC
┌─────────────────────────────────────────────────────────────┐
│                       SUI BLOCKCHAIN                         │
│  - Smart Contracts (Move)                                   │
│  - DEX (Cetus, Turbos, etc.)                               │
│  - Staking Validators                                       │
│  - Walrus (immutable memory storage)                        │
└─────────────────────────────────────────────────────────────┘
```

## Prérequis

- **Node.js** >= 18.x
- **Python** >= 3.11
- **Wallet SUI** avec quelques tokens pour les gas fees
- **Clé privée SUI** (hex format)

## Installation

### 1. Installer les dépendances Python

```bash
cd agent_architecture/nautilus
pip install -r requirements.txt
```

### 2. Installer les dépendances Node.js

```bash
npm install
```

### 3. Configuration

Créez un fichier `.env` :

```bash
cp .env.example .env
```

Éditez `.env` avec vos credentials :

```env
SUI_PRIVATE_KEY=0xvotre_cle_privee_ici
SUI_RPC_URL=https://fullnode.testnet.sui.io
BRIDGE_PORT=3001
```

⚠️ **SÉCURITÉ** : Ne committez JAMAIS votre `.env` avec la vraie clé privée !

## Utilisation

### Démarrage rapide

```bash
./start.sh
```

Ce script :
1. Vérifie les dépendances
2. Lance le Nimbus Bridge (port 3001)
3. Lance l'agent Python
4. Les deux communiquent via HTTP

### Démarrage manuel

**Terminal 1 - Nimbus Bridge** :
```bash
npm start
```

**Terminal 2 - Agent Python** :
```bash
python3 app.py
```

## Actions disponibles

L'agent peut exécuter ces actions on-chain :

### Trading
- `BUY_SUI` : Swap USDC → SUI
- `SELL_SUI` : Swap SUI → USDC

### Staking
- `STAKE_SUI` : Stake SUI auprès d'un validateur
- `UNSTAKE_SUI` : Unstake SUI

### Portfolio
- `GET_BALANCE` : Balance du wallet
- `GET_PORTFOLIO` : Tous les tokens détenus

### Transfert
- `TRANSFER` : Envoyer des tokens

## Stratégie de Trading

### Setup A - Trend Pullback
- **Biais** : EMA15 > EMA50 (15m) + Prix > VWAP
- **Entrée** : EMA9 > EMA21 (5m) + RSI > 50
- **Stop Loss** : 0.4× ATR(5m)
- **Take Profit** : TP1 = 1.0× ATR, TP2 = 1.5× ATR

### Setup B - VWAP Fade (Range)
- **Contexte** : EMA15 ≈ EMA50 (range)
- **Entrée SHORT** : Prix ≥ 1.0× ATR au-dessus VWAP + RSI > 70
- **Entrée LONG** : Prix ≥ 1.0× ATR en-dessous VWAP + RSI < 30
- **Stop** : 0.5× ATR
- **TP** : Retour au VWAP

### Risk Management
- **Risque par trade** : 1.5% de l'equity (30 USDC sur 2000 USDC)
- **Max perte journalière** : 2% (40 USDC)
- **Max positions** : 2 simultanées
- **Levier** : 3x

## Logs

### Format des logs

```
============================================================
 ITÉRATION #4 - 21:20:17
============================================================
[BINANCE] Prix: $1.3291 ▼ -0.015% | Trend: bearish | Vol 24h: $234.5M
[DECISION] BUY_SUI | Setup: TREND_PULLBACK_LONG | Confiance: 80%
[REASON] Pullback haussier: EMA9(1.3305)>EMA21(1.3295), RSI=62.3, ATR%=0.28%
[RISK] SL: $1.3250 | TP1: $1.3350 | TP2: $1.3400
[SIZE] Position: $6842.11 | Risque: $30.00
   [EXEC] Exécution: BUY_SUI
   [NIMBUS] ✅ BUY_SUI executed on-chain
   [NIMBUS] 📝 TX: 0xabc123...
 Mémoire Walrus: blob_xyz789...
```

## Tests

### Tester le bridge

```bash
# Health check
curl http://localhost:3001/health

# Wallet info
curl http://localhost:3001/wallet

# Exécuter un trade (test)
curl -X POST http://localhost:3001/execute \
  -H "Content-Type: application/json" \
  -d '{"action":"GET_BALANCE","params":{}}'
```

## Docker

Pour déployer en production dans un TEE AWS Nitro :

```bash
# Build
docker build -f Dockerfile -t chimera-nautilus-agent .

# Run
docker run -d \
  --name chimera-agent \
  -e SUI_PRIVATE_KEY=$SUI_PRIVATE_KEY \
  -e SUI_RPC_URL=https://fullnode.mainnet.sui.io \
  --restart unless-stopped \
  chimera-nautilus-agent
```

## Documentation Nautilus

- [Nautilus Overview](https://docs.sui.io/concepts/cryptography/nautilus)
- [Nautilus Design](https://docs.sui.io/concepts/cryptography/nautilus/nautilus-design)
- [Using Nautilus](https://docs.sui.io/concepts/cryptography/nautilus/using-nautilus)

## Documentation Nimbus

- [Nimbus SDK](https://docs.getnimbus.io/)
- [SUI Agent Kit](https://docs.getnimbus.io/sui-ai-agent/introduction)

## Sécurité

### Attestation TEE
Toutes les décisions sont signées cryptographiquement avec la clé de l'enclave Nautilus :

```python
signature = enclave.sign_message(decision)
memory_entry["signature"] = signature
memory_entry["pcr0"] = enclave.pcrs["PCR0"][:16]
```

### Walrus Storage
Les décisions sont stockées de manière immuable sur Walrus pour audit :

```python
blob_id = WalrusMemory.save(memory_entry)
# blob_id = "0x123abc..." (vérifiable on-chain)
```

### Private Key
- La clé privée SUI reste dans l'enclave TEE
- Jamais exposée dans les logs
- Communication chiffrée via HTTPS (production)

## Troubleshooting

### "Nimbus Bridge non disponible"
1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez le port 3001 : `lsof -i :3001`
3. Lancez manuellement : `npm start`

### "Agent not initialized"
1. Vérifiez `.env` avec `SUI_PRIVATE_KEY`
2. Format de la clé : `0x...` (hex)
3. RPC accessible : `curl https://fullnode.testnet.sui.io`

### "Insufficient gas"
1. Vérifiez balance : `curl http://localhost:3001/wallet`
2. Obtenez des tokens testnet : [SUI Faucet](https://discord.gg/sui)

## Contribuer

1. Fork le repo
2. Créez une branche : `git checkout -b feature/ma-feature`
3. Committez : `git commit -m "Add: ma feature"`
4. Push : `git push origin feature/ma-feature`
5. Pull Request

## Licence

MIT

## Auteurs

Chimera Team - SUI Hackathon DeVinci 2025
