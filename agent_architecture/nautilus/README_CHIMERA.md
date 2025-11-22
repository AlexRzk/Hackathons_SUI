# 🐚 Chimera Nautilus Agent - Guide de Démarrage

## 📋 Vue d'ensemble

Ce dossier contient l'implémentation de l'agent Chimera tournant dans un environnement TEE (Trusted Execution Environment) basé sur **Nautilus** (framework SUI pour AWS Nitro Enclaves).

### Architecture en 3 Phases

#### Phase 1: Hello World ✅ (Local)
**Fichier**: `hello_nautilus.py`  
**But**: Prouver que l'architecture Nautilus fonctionne  
**Exécution**: Mac/Linux/Windows (simulation TEE)

```bash
# Installation
pip install -r requirements.txt

# Lancement
python3 hello_nautilus.py

# Test
curl http://localhost:3000/health_check
curl http://localhost:3000/get_attestation
curl -X POST -H 'Content-Type: application/json' \
     -d '{"payload": {"name": "Chimera"}}' \
     http://localhost:3000/hello
```

**Ce que ça fait**:
- ✅ Génère une paire de clés Ed25519 éphémère
- ✅ Simule des PCRs (Platform Configuration Registers)
- ✅ Crée un document d'attestation
- ✅ Signe cryptographiquement toutes les réponses

#### Phase 2: Intégration Nimbus (En cours)
**Fichier**: `app.py` (sera remplacé)  
**But**: Ajouter la stack DeFi SUI via Nimbus Agent Kit

```bash
# Installation Nimbus
git clone https://github.com/nimbus-tech/agent-kit sui-agent-kit
cd sui-agent-kit && pip install -e .

# Configuration
export SUI_PRIVATE_KEY="suiprivkey..."
export SUI_NETWORK="testnet"
```

#### Phase 3: Déploiement AWS Nitro (Production)
**Dossier**: `src/nautilus-server/`  
**But**: Déploiement réel avec attestation matérielle

```bash
# Build l'enclave (Rust)
make build ENCLAVE_APP=chimera

# Deploy sur AWS
sh configure_enclave.sh chimera

# Vérification PCRs
cat out/nitro.pcrs
```

---

## 🔧 Développement Local

### Prérequis
```bash
python3 --version  # >= 3.9
pip install -r requirements.txt
```

### Structure des Fichiers

```
nautilus/
├── hello_nautilus.py          # Phase 1: Hello World
├── app.py                      # Phase 2: Agent DeFi complet
├── requirements.txt            # Dépendances Python
├── Dockerfile                  # Build pour production
├── src/nautilus-server/        # Code Rust pour AWS Nitro
│   └── src/apps/chimera/       # Logique custom de l'agent
└── move/chimera/               # Smart contracts SUI
```

### Tester l'Attestation

Le fichier `hello_nautilus.py` simule ce que fait le code Rust dans `src/nautilus-server/src/common.rs`:

**Équivalences Code**:
| Python (simulation)      | Rust (production)           |
|-------------------------|-----------------------------|
| `EnclaveState.__init__` | `AppState` initialization   |
| `MockNSM.generate_pcrs` | `nsm_api::driver::nsm_get_attestation_doc` |
| `sign_message()`        | `kp.sign(&signing_payload)` |
| `/get_attestation`      | `pub async fn get_attestation()` |

---

## 🚀 Intégration Nimbus

### Qu'est-ce que Nimbus?

Nimbus Agent Kit est le SDK officiel pour construire des agents DeFi autonomes sur SUI. Il fournit:

- **Wallet Management**: Gestion sécurisée des clés privées
- **DeFi Protocols**: Abstraction pour DEX, Lending, Staking
- **Transaction Building**: Construction/signature de transactions SUI
- **Price Feeds**: Accès aux oracles de prix

### Installation

```bash
# Méthode 1: Via le dossier cloné
cd ../sui-agent-kit
pip install -e .

# Méthode 2: Depuis PyPI (si disponible)
pip install nimbus-agent-kit
```

### Configuration

Créer `.env`:
```bash
SUI_PRIVATE_KEY=suiprivkey1qp...  # Ta clé privée SUI
SUI_NETWORK=testnet               # testnet ou mainnet
WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space/v1/store
```

### Exemple d'Usage dans l'Agent

```python
import nimbus_agent_kit as nimbus

# 1. Initialisation
agent = nimbus.Agent(
    private_key=os.getenv("SUI_PRIVATE_KEY"),
    network=os.getenv("SUI_NETWORK")
)

# 2. Vérifier le balance
balance = agent.get_balance()
print(f"Balance: {balance} SUI")

# 3. Interagir avec un DEX
price = agent.dex.get_price("SUI", "USDC")
if price < threshold:
    tx = agent.dex.swap("SUI", "USDC", amount=10)
    print(f"Swap effectué: {tx}")

# 4. Staking
rewards = agent.staking.claim_rewards()
```

---

## 🐘 Intégration Walrus

Walrus stocke la "mémoire" de l'agent (ses raisonnements) on-chain de manière immuable.

### Comment ça marche?

1. **L'agent prend une décision** (ex: "SWAP SUI → USDC")
2. **Il enregistre son raisonnement**:
   ```json
   {
     "action": "SWAP",
     "reasoning": "Prix SUI en dessous de 2.50$, opportunité d'achat",
     "timestamp": 1744683300,
     "confidence": 0.87
   }
   ```
3. **Sauvegarde sur Walrus**:
   ```python
   blob_id = save_to_walrus(reasoning_data)
   # blob_id = "9a3c7f2e..."
   ```
4. **Enregistrement on-chain** (dans le smart contract SUI):
   ```move
   public fun record_decision(
       agent: &Agent,
       blob_id: vector<u8>,
       ctx: &mut TxContext
   )
   ```

### Code Python

```python
def save_to_walrus(data: dict) -> str:
    """Sauvegarde immuable sur Walrus"""
    url = "https://publisher.walrus-testnet.walrus.space/v1/store"
    payload = json.dumps(data)
    
    response = requests.put(url, data=payload)
    if response.status_code == 200:
        return response.json()["newlyCreated"]["blobObject"]["blobId"]
    raise Exception("Walrus upload failed")
```

---

## 📊 Comparaison: Simulation vs Production

| Aspect              | `hello_nautilus.py` (Local) | `src/nautilus-server/` (AWS) |
|---------------------|----------------------------|------------------------------|
| **Langage**         | Python                      | Rust                         |
| **Attestation**     | Simulée (hash local)        | Réelle (NSM driver)          |
| **PCRs**            | Hash déterministe           | Mesure matérielle CPU        |
| **Signature Racine**| Auto-signée                 | AWS Root Certificate         |
| **Vérification**    | Trust on first use          | Vérifiable on-chain via SUI  |
| **Performance**     | ~50 req/s                   | ~500 req/s (optimisé)        |

---

## 🎯 Checklist Hackathon

- [x] **Nautilus Hello World**: Script Python fonctionnel avec attestation simulée
- [ ] **Nimbus SDK**: Intégré et testé avec une vraie transaction SUI
- [ ] **Walrus**: Au moins 1 blob sauvegardé et récupéré
- [ ] **Smart Contract**: Déployé sur testnet SUI
- [ ] **Démo**: Vidéo montrant l'agent prendre une décision + preuve on-chain

---

## 🐛 Troubleshooting

### Erreur: `ModuleNotFoundError: No module named 'ed25519'`
```bash
pip install ed25519==1.5
```

### Erreur: `nimbus_agent_kit not found`
```bash
cd ../sui-agent-kit
pip install -e .
# OU: vérifier qu'il est dans PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:/path/to/sui-agent-kit"
```

### Walrus: Timeout
```bash
# Vérifier que le publisher est accessible
curl https://publisher.walrus-testnet.walrus.space/v1

# Augmenter timeout
requests.put(url, data=payload, timeout=10)
```

### AWS Nitro: Cannot build
```bash
# Sur Mac: utiliser Docker pour cross-compile
docker run --rm -v $(pwd):/workspace \
    public.ecr.aws/amazonlinux/amazonlinux:2023 \
    bash -c "cd /workspace && make build ENCLAVE_APP=chimera"
```

---

## 📚 Ressources

- [Documentation Nautilus](https://github.com/MystenLabs/nautilus)
- [Nimbus Agent Kit](https://github.com/nimbus-tech/agent-kit)
- [Walrus Docs](https://docs.walrus.site/)
- [SUI Move Book](https://move-book.com/)
- [AWS Nitro Enclaves](https://docs.aws.amazon.com/enclaves/)

---

## 🤝 Contribution

Ce code est prévu pour le **SUI Hackathon DeVinci 2025**. Pour toute question:
- Discord: `#chimera-protocol`
- Email: `team@chimera.protocol`
