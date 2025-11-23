module game::monster_hatchery {
    use sui::clock::Clock;
    use std::string::String;
    use sui::coin::Coin;
    use sui::balance::{Self, Balance};
    
    // Import de ton module de monnaie
    use game::gem_currency::GEM_CURRENCY;

    // --- Constantes ---
    const PRICE_COMMON: u64 = 100;
    const PRICE_RARE: u64 = 500;
    const PRICE_EPIC: u64 = 1000;

    const RARITY_COMMON: u8 = 1;
    const RARITY_RARE: u8 = 2;
    const RARITY_EPIC: u8 = 3;

    const ENotEnoughMoney: u64 = 0;
    const EUnknownRarity: u64 = 1;

    // --- Les Objets (public struct pour Move 2024) ---

    public struct Egg has key, store {
        id: UID,
        rarity: u8,
    }

    public struct Monster has key, store {
        id: UID,
        name: String,
        rarity: u8,
        strength: u64,
        agility: u64,
        intelligence: u64,
        level: u8,
    }

    public struct Shop has key {
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

    // --- Fonction 1 : Acheter un oeuf ---

    #[allow(lint(self_transfer))]
    public fun buy_egg(
        shop: &mut Shop, 
        payment: &mut Coin<GEM_CURRENCY>, 
        rarity_choice: u8,
        ctx: &mut TxContext
    ) {
        // 1. Définir le prix
        let price = if (rarity_choice == RARITY_COMMON) { PRICE_COMMON }
        else if (rarity_choice == RARITY_RARE) { PRICE_RARE }
        else if (rarity_choice == RARITY_EPIC) { PRICE_EPIC }
        else { abort EUnknownRarity };

        // 2. Vérifier le solde
        assert!(payment.value() >= price, ENotEnoughMoney);
        
        // 3. Paiement
        let coin_paid = payment.split(price, ctx);
        balance::join(&mut shop.profits, coin_paid.into_balance());

        // 4. Création de l'oeuf
        let egg = Egg {
            id: object::new(ctx),
            rarity: rarity_choice
        };

        // 5. Envoi au joueur
        transfer::public_transfer(egg, ctx.sender());
    }

    // --- Fonction 2 : Faire éclore l'oeuf ---

    #[allow(lint(self_transfer))]
    public fun hatch_egg(egg: Egg, clock: &Clock, monster_name: vector<u8>, ctx: &mut TxContext) {
        let rarity = egg.rarity;
        
        // 1. Destruction de l'objet Oeuf (Unpacking)
        let Egg { id, rarity: _ } = egg;
        object::delete(id); 

        // 2. Calcul aléatoire (basé sur l'horloge)
        let time_factor = clock.timestamp_ms(); 
        
        // Stats de base
        let (base_str, base_agi, base_int) = if (rarity == RARITY_COMMON) { (5, 5, 5) }
        else if (rarity == RARITY_RARE) { (15, 15, 15) }
        else { (30, 30, 30) };

        // Bonus aléatoire (Correction des parenthèses appliquée ici)
        let random_bonus = ((time_factor % 10) as u64);

        // 3. Création du Monstre
        let monster = Monster {
            id: object::new(ctx),
            name: std::string::utf8(monster_name),
            rarity: rarity,
            strength: base_str + random_bonus,
            agility: base_agi + random_bonus,
            intelligence: base_int + random_bonus,
            level: 1
        };

        // 4. Envoi au joueur
        transfer::public_transfer(monster, ctx.sender());
    }
}