# Chimera Nautilus Agent - Docker Image
# IMPORTANT: Build depuis le dossier agent_architecture avec: 
#   docker build -f nautilus/Dockerfile -t chimera-nautilus-agent .
FROM python:3.11-slim

WORKDIR /app

# 1. Installation des dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Copie des fichiers de dépendances
COPY nautilus/requirements.txt .

# 3. Installation des dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copie du SDK Nimbus
COPY sui-agent-kit /app/sui-agent-kit

# 5. Copie des fichiers de l'agent
COPY nautilus/app.py .
COPY nautilus/battle_engine.py .
COPY nautilus/battle_orchestrator.py .

# 6. Exposition du port (si nécessaire pour le serveur hello_nautilus)
EXPOSE 3000

# 7. Lancement de l'agent
CMD ["python3", "-u", "app.py"]