module game::monster_hatchery {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    
    use game::gem_currency::GEM_CURRENCY;

    // --- Constantes ---
    // Prix des oeufs
    const PRICE_COMMON: u64 = 100;
    const PRICE_RARE: u64 = 500;
    const PRICE_EPIC: u64 = 1000;

    // Raretés
    const RARITY_COMMON: u8 = 1;
    const RARITY_RARE: u8 = 2;
    const RARITY_EPIC: u8 = 3;

    // Erreurs
    const ENotEnoughMoney: u64 = 0;
    const EUnknownRarity: u64 = 1;

    // --- Les Objets ---

    // L'objet OEUF (Intermédiaire)
    struct Egg has key, store {
        id: UID,
        rarity: u8, // 1 = Common, 2 = Rare, 3 = Epic
    }

    // L'objet MONSTRE (Final)
    struct Monster has key, store {
        id: UID,
        name: String,
        rarity: u8,
        strength: u64,
        agility: u64,
        intelligence: u64,
        level: u8,
    }

    // La Boutique
    struct Shop has key {
        id: UID,
        profits: Balance<GEM_CURRENCY>
    }

    // --- Initialisation ---
    
    fun init(ctx: &mut TxContext) {
        transfer::share_object(Shop {
            id: object::new(ctx),
            profits: balance::zero()
        });
    }

    // --- Fonctions d'Achat (Mint de l'Oeuf) ---

    public entry fun buy_egg(
        shop: &mut Shop, 
        payment: &mut Coin<GEM_CURRENCY>, 
        rarity_choice: u8,
        ctx: &mut TxContext
    ) {
        // 1. Déterminer le prix
        let price = if (rarity_choice == RARITY_COMMON) { PRICE_COMMON }
        else if (rarity_choice == RARITY_RARE) { PRICE_RARE }
        else if (rarity_choice == RARITY_EPIC) { PRICE_EPIC }
        else { abort EUnknownRarity };

        // 2. Vérifier et payer
        assert!(coin::value(payment) >= price, ENotEnoughMoney);
        let coin_paid = coin::split(payment, price, ctx);
        balance::join(&mut shop.profits, coin::into_balance(coin_paid));

        // 3. Créer l'Oeuf correspondant
        let egg = Egg {
            id: object::new(ctx),
            rarity: rarity_choice
        };

        transfer::public_transfer(egg, tx_context::sender(ctx));
    }

    // --- Fonction d'Eclosion (Burn Egg -> Mint Monster) ---

    // Note: On a besoin de l'objet "Clock" pour générer un peu d'aléatoire basé sur le temps
    public entry fun hatch_egg(egg: Egg, clock: &Clock, monster_name: vector<u8>, ctx: &mut TxContext) {
        
        // 1. On récupère les infos de l'oeuf avant de le détruire
        let rarity = egg.rarity;
        
        // 2. DESTRUCTION DE L'OEUF (Unpacking)
        let Egg { id, rarity: _ } = egg;
        object::delete(id); // On supprime définitivement l'ID de l'oeuf de la blockchain

        // 3. Calcul des stats basé sur la rareté et le temps
        // (Ceci est un pseudo-random simple pour l'exemple)
        let time_factor = clock::timestamp_ms(clock); 
        
        // Base stats selon la rareté
        let (base_str, base_agi, base_int) = if (rarity == RARITY_COMMON) { (5, 5, 5) }
        else if (rarity == RARITY_RARE) { (15, 15, 15) }
        else { (30, 30, 30) }; // Epic

        // Bonus aléatoire (modulo 10)
        let random_bonus = (time_factor % 10) as u64;

        // 4. Création du Monstre
        let monster = Monster {
            id: object::new(ctx),
            name: string::utf8(monster_name),
            rarity: rarity,
            strength: base_str + random_bonus,
            agility: base_agi + random_bonus,
            intelligence: base_int + random_bonus,
            level: 1
        };

        transfer::public_transfer(monster, tx_context::sender(ctx));
    }
}