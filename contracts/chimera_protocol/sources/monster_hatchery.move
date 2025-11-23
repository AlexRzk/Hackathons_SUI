module game::monster_hatchery {
    use sui::clock::Clock;
    use std::string::String;
    use sui::coin::Coin;
    use sui::balance::{Self, Balance};
    use game::gem_currency::GEM_CURRENCY;

    const PRICE_COMMON: u64 = 100;
    const PRICE_RARE: u64 = 500;
    const PRICE_EPIC: u64 = 1000;
    const RARITY_COMMON: u8 = 1;
    const RARITY_RARE: u8 = 2;
    const RARITY_EPIC: u8 = 3;
    const ENotEnoughMoney: u64 = 0;
    const EUnknownRarity: u64 = 1;

    public struct Egg has key, store { id: UID, rarity: u8 }

    public struct Monster has key, store {
        id: UID,
        name: String,
        rarity: u8,
        strength: u64,
        agility: u64,
        intelligence: u64,
        level: u8,
        experience: u64 
    }

    public struct Shop has key { id: UID, profits: Balance<GEM_CURRENCY> }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(Shop { id: object::new(ctx), profits: balance::zero() });
    }

    #[allow(lint(self_transfer))]
    public fun buy_egg(shop: &mut Shop, payment: &mut Coin<GEM_CURRENCY>, rarity_choice: u8, ctx: &mut TxContext) {
        let price = if (rarity_choice == RARITY_COMMON) { PRICE_COMMON }
        else if (rarity_choice == RARITY_RARE) { PRICE_RARE }
        else if (rarity_choice == RARITY_EPIC) { PRICE_EPIC }
        else { abort EUnknownRarity };

        assert!(payment.value() >= price, ENotEnoughMoney);
        let coin_paid = payment.split(price, ctx);
        balance::join(&mut shop.profits, coin_paid.into_balance());

        transfer::public_transfer(Egg { id: object::new(ctx), rarity: rarity_choice }, ctx.sender());
    }

    #[allow(lint(self_transfer))]
    public fun hatch_egg(egg: Egg, clock: &Clock, monster_name: vector<u8>, ctx: &mut TxContext) {
        let Egg { id, rarity } = egg;
        object::delete(id); 
        
        let time_factor = clock.timestamp_ms(); 
        let (base_str, base_agi, base_int) = if (rarity == RARITY_COMMON) { (5, 5, 5) } else if (rarity == RARITY_RARE) { (15, 15, 15) } else { (30, 30, 30) };
        let random_bonus = ((time_factor % 10) as u64);

        transfer::public_transfer(Monster {
            id: object::new(ctx),
            name: std::string::utf8(monster_name),
            rarity: rarity,
            strength: base_str + random_bonus,
            agility: base_agi + random_bonus,
            intelligence: base_int + random_bonus,
            level: 1,
            experience: 0
        }, ctx.sender());
    }

    // --- NOUVELLES FONCTIONS (GETTERS & UPDATER) ---

    // Permet au module de combat de lire le nom
    public fun get_name(monster: &Monster): String { monster.name }

    // Permet au module de combat de mettre à jour l'XP
    public fun update_stats_after_battle(monster: &mut Monster, xp_gain: u64) {
        monster.experience = monster.experience + xp_gain;
        if (monster.experience >= 100) {
            monster.level = monster.level + 1;
            monster.experience = 0;
            monster.strength = monster.strength + 2; // Le monstre devient plus fort !
            monster.agility = monster.agility + 1;
            monster.intelligence = monster.intelligence + 1;
        };
    }
}