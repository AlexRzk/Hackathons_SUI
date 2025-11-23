module game::monster_hatchery {
    use game::cim_currency::CIM_CURRENCY;
    use std::string::{Self as string, String};
    use sui::balance::{Self as balance, Balance};
    use sui::clock::{Self as clock, Clock};
    use sui::coin;
    use sui::coin::Coin;
    use sui::display;
    use sui::object::{Self as object, UID};
    use sui::transfer;
    use sui::tx_context::{Self as tx_context, TxContext};

    const PRICE_COMMON: u64 = 100;
    const PRICE_RARE: u64 = 500;
    const PRICE_EPIC: u64 = 1_000;
    const PRICE_LEGENDARY: u64 = 5_000;

    const RARITY_COMMON: u8 = 1;
    const RARITY_RARE: u8 = 2;
    const RARITY_EPIC: u8 = 3;
    const RARITY_LEGENDARY: u8 = 4;

    const ENotEnoughMoney: u64 = 0;
    const EUnknownRarity: u64 = 1;
    const EIncorrectAmount: u64 = 2;

    public struct Egg has key, store {
        id: UID,
        rarity: u8,
        rarity_label: String,
        image_url: String
    }

    public struct Monster has key, store {
        id: UID,
        name: String,
        rarity: u8,
        rarity_label: String,
        strength: u64,
        agility: u64,
        intelligence: u64,
        level: u8,
        experience: u64,
        image_url: String
    }

    public struct Shop has key { id: UID, profits: Balance<CIM_CURRENCY> }

    public entry fun init(ctx: &mut TxContext) {
        transfer::share_object(Shop { id: object::new(ctx), profits: balance::zero() });
    }

    /// Users pay the exact CIM amount to receive an Egg matching the selected rarity.
    public entry fun buy_egg(
        shop: &mut Shop,
        payment: Coin<CIM_CURRENCY>,
        rarity_choice: u8,
        ctx: &mut TxContext
    ) {
        let price = price_for_rarity(rarity_choice);
        assert!(coin::value(&payment) >= price, ENotEnoughMoney);
        assert!(coin::value(&payment) == price, EIncorrectAmount);

        balance::join(&mut shop.profits, coin::into_balance(payment));
        transfer::public_transfer(
            Egg {
                id: object::new(ctx),
                rarity: rarity_choice,
                rarity_label: rarity_label(rarity_choice),
                image_url: image_url_for_rarity(rarity_choice)
            },
            tx_context::sender(ctx)
        );
    }

    /// Burns an Egg and mints a Monster with pseudo-randomized stats.
    public entry fun hatch_egg(egg: Egg, clock: &Clock, monster_name: vector<u8>, ctx: &mut TxContext) {
        let Egg { id, rarity, rarity_label: _, image_url: _ } = egg;
        object::delete(id);

        let timestamp = clock::timestamp_ms(clock);
        let random_bonus = (timestamp % 10) as u64;
        let (base_str, base_agi, base_int) = base_stats(rarity);

        transfer::public_transfer(Monster {
            id: object::new(ctx),
            name: string::utf8(monster_name),
            rarity,
            rarity_label: rarity_label(rarity),
            strength: base_str + random_bonus,
            agility: base_agi + random_bonus,
            intelligence: base_int + random_bonus,
            level: 1,
            experience: 0,
            image_url: image_url_for_rarity(rarity)
        }, tx_context::sender(ctx));
    }

    public fun get_name(monster: &Monster): String { monster.name }

    /// Exposed to the battle module to settle level/XP rewards after fights.
    public(package) fun update_stats_after_battle(monster: &mut Monster, xp_gain: u64) {
        monster.experience = monster.experience + xp_gain;
        while (monster.experience >= 100) {
            monster.level = monster.level + 1;
            monster.experience = monster.experience - 100;
            specialize(monster);
        }
    }

    public entry fun init_display(ctx: &mut TxContext) {
        let egg_display = display::new<Egg>(
            ctx,
            vector[
                (string::utf8(b"name".to_vec()), string::utf8(b"{rarity_label}".to_vec())),
                (string::utf8(b"description".to_vec()), string::utf8(b"Hatchery egg • DNA tier {rarity}".to_vec())),
                (string::utf8(b"image_url".to_vec()), string::utf8(b"{image_url}".to_vec()))
            ]
        );
        transfer::share_object(egg_display);

        let monster_display = display::new<Monster>(
            ctx,
            vector[
                (string::utf8(b"name".to_vec()), string::utf8(b"{name}".to_vec())),
                (string::utf8(b"description".to_vec()), string::utf8(b"Lvl {level} • {rarity_label}".to_vec())),
                (string::utf8(b"image_url".to_vec()), string::utf8(b"{image_url}".to_vec()))
            ]
        );
        transfer::share_object(monster_display);
    }

    fun price_for_rarity(rarity: u8) : u64 {
        if (rarity == RARITY_COMMON) {
            PRICE_COMMON
        } else if (rarity == RARITY_RARE) {
            PRICE_RARE
        } else if (rarity == RARITY_EPIC) {
            PRICE_EPIC
        } else if (rarity == RARITY_LEGENDARY) {
            PRICE_LEGENDARY
        } else {
            abort EUnknownRarity
        }
    }

    fun base_stats(rarity: u8): (u64, u64, u64) {
        if (rarity == RARITY_COMMON) {
            (5, 5, 5)
        } else if (rarity == RARITY_RARE) {
            (15, 15, 15)
        } else if (rarity == RARITY_EPIC) {
            (30, 30, 30)
        } else {
            (60, 60, 60)
        }
    }

    fun specialize(monster: &mut Monster) {
        if (monster.strength >= monster.agility && monster.strength >= monster.intelligence) {
            monster.strength = monster.strength + 3;
            monster.agility = monster.agility + 1;
        } else if (monster.agility > monster.strength && monster.agility >= monster.intelligence) {
            monster.strength = monster.strength + 1;
            monster.agility = monster.agility + 3;
        } else {
            monster.agility = monster.agility + 1;
            monster.intelligence = monster.intelligence + 3;
        }
    }

    fun rarity_label(rarity: u8): String {
        if (rarity == RARITY_COMMON) {
            string::utf8(b"Common Tier".to_vec())
        } else if (rarity == RARITY_RARE) {
            string::utf8(b"Rare Tier".to_vec())
        } else if (rarity == RARITY_EPIC) {
            string::utf8(b"Epic Tier".to_vec())
        } else {
            string::utf8(b"Legendary Tier".to_vec())
        }
    }

    fun image_url_for_rarity(rarity: u8): String {
        if (rarity == RARITY_COMMON) {
            string::utf8(b"https://your-domain.example/api/rarity-art?rarity=common".to_vec())
        } else if (rarity == RARITY_RARE) {
            string::utf8(b"https://your-domain.example/api/rarity-art?rarity=rare".to_vec())
        } else if (rarity == RARITY_EPIC) {
            string::utf8(b"https://your-domain.example/api/rarity-art?rarity=epic".to_vec())
        } else {
            string::utf8(b"https://your-domain.example/api/rarity-art?rarity=legendary".to_vec())
        }
    }
}