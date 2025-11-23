#!/bin/bash
# Script de démarrage Docker pour Chimera Nautilus Agent

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🐚 CHIMERA NAUTILUS AGENT - Démarrage Docker               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "   Installez Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Vérifier que Docker est en cours d'exécution
if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas démarré"
    echo "   Démarrez Docker Desktop et réessayez"
    exit 1
fi

echo "✅ Docker détecté et en cours d'exécution"
echo ""

# Choix du mode
echo "Choisissez le mode de déploiement:"
echo "  1) Docker Compose (recommandé - avec auto-restart)"
echo "  2) Docker run simple"
echo ""
read -p "Votre choix [1]: " choice
choice=${choice:-1}

if [ "$choice" == "1" ]; then
    echo ""
    echo "🔨 Construction de l'image avec Docker Compose..."
    cd ..
    docker-compose -f nautilus/docker-compose.yml build
    
    echo ""
    echo "🚀 Démarrage de l'agent..."
    docker-compose -f nautilus/docker-compose.yml up -d
    
    echo ""
    echo "✅ Agent démarré en arrière-plan!"
    echo ""
    echo "📊 Voir les logs en temps réel:"
    echo "   docker-compose -f nautilus/docker-compose.yml logs -f chimera-agent"
    echo ""
    echo "🛑 Arrêter l'agent:"
    echo "   docker-compose -f nautilus/docker-compose.yml down"
    echo ""
    echo "📈 Voir le statut:"
    echo "   docker-compose -f nautilus/docker-compose.yml ps"
    
else
    echo ""
    echo "🔨 Construction de l'image Docker..."
    cd ..
    docker build -f nautilus/Dockerfile -t chimera-nautilus-agent .
    
    echo ""
    echo "🚀 Démarrage de l'agent..."
    docker run -d \
        --name chimera-agent \
        --restart unless-stopped \
        chimera-nautilus-agent
    
    echo ""
    echo "✅ Agent démarré en arrière-plan!"
    echo ""
    echo "📊 Voir les logs en temps réel:"
    echo "   docker logs -f chimera-agent"
    echo ""
    echo "🛑 Arrêter l'agent:"
    echo "   docker stop chimera-agent"
    echo "   docker rm chimera-agent"
    echo ""
    echo "📈 Voir le statut:"
    echo "   docker ps | grep chimera"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
