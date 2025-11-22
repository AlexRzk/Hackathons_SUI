#!/bin/bash
# Script de démarrage Nautilus + Nimbus Bridge

set -e

echo "=========================================="
echo "🚀 CHIMERA NAUTILUS AGENT + NIMBUS BRIDGE"
echo "=========================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non installé"
    echo "   Installez Node.js: https://nodejs.org/"
    exit 1
fi

# Vérifier Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 non installé"
    exit 1
fi

# Installer dépendances TypeScript si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances Nimbus Bridge..."
    npm install
    echo "✅ Dépendances installées"
    echo ""
fi

# Vérifier fichier .env
if [ ! -f ".env" ]; then
    echo "⚠️  Fichier .env non trouvé"
    echo "   Copiez .env.example vers .env et configurez votre clé privée SUI"
    echo ""
    echo "   cp .env.example .env"
    echo "   # Puis éditez .env avec votre SUI_PRIVATE_KEY"
    echo ""
    read -p "Continuer en mode simulation? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Démarrer le bridge Nimbus en arrière-plan
echo "🌉 Démarrage du Nimbus Bridge..."
npm start &
BRIDGE_PID=$!

# Attendre que le bridge soit prêt
echo "   Attente de la connexion..."
sleep 3

# Vérifier si le bridge est up
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Nimbus Bridge opérationnel (PID: $BRIDGE_PID)"
else
    echo "⚠️  Bridge non accessible - fonctionnera en mode simulation"
fi

echo ""
echo "🤖 Démarrage de l'agent Nautilus..."
echo "=========================================="
echo ""

# Démarrer l'agent Python
python3 -u app.py

# Cleanup au SIGINT
trap "echo ''; echo '🛑 Arrêt...'; kill $BRIDGE_PID 2>/dev/null; exit 0" SIGINT SIGTERM

wait
