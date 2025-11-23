export const NETWORK = "testnet";

// 1. L'adresse du Package (Nouveau déploiement)
export const PACKAGE_ID = "0x58310d0f0ba3013e87b32b538b6639dbb1586d34b3328988a63469069d415cf3";

// 2. L'adresse de la Boutique (Objet Partagé)
export const SHOP_ID = "0xb2242ae1ede6cfc3901b3edd0f39f097396670059df9c05dd5b8fd2dd0ce85af";

// 3. L'adresse de la Config de Combat (Objet Partagé pour le TEE)
export const BATTLE_CONFIG_ID = "0x9fd8ab371ea32fac24bd9879d09299da2c86359385b8b1ba50e59e4fbc39b7ae";

// 4. Le Type de la Monnaie (ATTENTION : C'est maintenant du CIM !)
export const CIM_COIN_TYPE = `${PACKAGE_ID}::cim_currency::CIM_CURRENCY`;

// 5. L'Horloge (Toujours 0x6)
export const CLOCK_ID = "0x6";