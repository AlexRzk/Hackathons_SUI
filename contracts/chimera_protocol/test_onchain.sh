#!/bin/bash
# Test du protocole Chimera sur SUI Testnet

PACKAGE_ID="0x40494ad6162483913a9de9578fb4998c8ce356cb44e4c5d32d460fc847336905"
SHOP_ID="0xbeb37411817300059e51bb9f512e1ec142969c1dfa6e39c868d01c9e72126491"
BATTLE_CONFIG="0x95e8ccf38aa63f76874ab77e4f320b65b871284e888f45e66c5b10a1d85a1508"
TREASURY_CAP="0x30f305c76a896704845bcada99c42241bda20d4b9f0f9e8598208004b8d894a3"

echo "=========================================="
echo "  TEST CHIMERA PROTOCOL - SUI TESTNET"
echo "=========================================="
echo ""

# 1. Minter des CIM tokens
echo "1️⃣  Mint de 10000 CIM tokens..."
MINT_TX=$(sui client call \
  --package $PACKAGE_ID \
  --module cim_currency \
  --function mint \
  --args $TREASURY_CAP 10000 \
  --gas-budget 10000000)

echo "✅ Tokens mintés"
echo ""

# 2. Récupérer l'ID du coin CIM
echo "2️⃣  Récupération des objets..."
CIM_COIN_ID=$(sui client objects --json | jq -r '.[] | select(.data.content.type | contains("CIM_CURRENCY")) | .data.objectId' | head -1)
echo "💰 CIM Coin ID: $CIM_COIN_ID"
echo ""

# 3. Acheter un œuf
echo "3️⃣  Achat d'un œuf RARE..."
sui client call \
  --package $PACKAGE_ID \
  --module monster_hatchery \
  --function buy_egg \
  --args $SHOP_ID $CIM_COIN_ID 2 \
  --gas-budget 10000000

echo "✅ Œuf acheté"
echo ""

# 4. Récupérer l'ID de l'œuf
echo "4️⃣  Récupération de l'œuf..."
sleep 2
EGG_ID=$(sui client objects --json | jq -r '.[] | select(.data.content.type | contains("Egg")) | .data.objectId' | head -1)
echo "🥚 Egg ID: $EGG_ID"
echo ""

# 5. Faire éclore l'œuf
echo "5️⃣  Faire éclore l'œuf en monstre..."
sui client call \
  --package $PACKAGE_ID \
  --module monster_hatchery \
  --function hatch_egg \
  --args $EGG_ID 0x6 "DragonFeu" \
  --gas-budget 10000000

echo "✅ Monstre créé!"
echo ""

# 6. Afficher le monstre
echo "6️⃣  Stats du monstre:"
sleep 2
MONSTER_ID=$(sui client objects --json | jq -r '.[] | select(.data.content.type | contains("Monster")) | .data.objectId' | head -1)
echo "🐉 Monster ID: $MONSTER_ID"
sui client object $MONSTER_ID --json | jq '.data.content.fields'
echo ""

echo ""

# 7. Explorer
echo "7️⃣  Explorer les objets:"
echo "🔗 Package: https://testnet.suivision.xyz/package/$PACKAGE_ID"
echo "🔗 Shop: https://testnet.suivision.xyz/object/$SHOP_ID"
echo "🔗 Monster: https://testnet.suivision.xyz/object/$MONSTER_ID"
echo ""
echo "✅ Tests terminés!"
echo ""
echo "💡 Pour créer plus de monstres:"
echo "   1. Mint CIM: sui client call --package $PACKAGE_ID --module cim_currency --function mint --args $TREASURY_CAP 10000 --gas-budget 10000000"
echo "   2. Buy Egg: sui client call --package $PACKAGE_ID --module monster_hatchery --function buy_egg --args $SHOP_ID <CIM_COIN_ID> 2 --gas-budget 10000000"
echo "   3. Hatch: sui client call --package $PACKAGE_ID --module monster_hatchery --function hatch_egg --args <EGG_ID> 0x6 NomMonstre --gas-budget 10000000"
