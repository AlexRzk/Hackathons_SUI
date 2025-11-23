module game::monster_battle {
    use sui::event;
    use game::monster_hatchery::{Self, Monster};

    const ENotAuthorized: u64 = 999;

    // L'objet qui sait qui est l'arbitre officiel (TEE)
    public struct BattleConfig has key {
        id: UID,
        tee_address: address
    }

    // Un événement pour prévenir le site web
    public struct BattleEvent has copy, drop {
        winner_id: ID,
        loser_id: ID,
        xp_gained: u64
    }

    fun init(ctx: &mut TxContext) {
        // Au déploiement, TON adresse devient l'adresse du TEE
        transfer::share_object(BattleConfig {
            id: object::new(ctx),
            tee_address: ctx.sender() 
        });
    }

    // La fonction que seul le script Python peut appeler
    public fun settle_battle(
        config: &BattleConfig, 
        winner: &mut Monster, 
        loser: &Monster, 
        xp_gain: u64,
        ctx: &mut TxContext
    ) {
        // Sécurité : On vérifie la signature
        assert!(ctx.sender() == config.tee_address, ENotAuthorized);

        // On donne l'XP
        monster_hatchery::update_stats_after_battle(winner, xp_gain);

        // On prévient le monde
        event::emit(BattleEvent {
            winner_id: object::id(winner),
            loser_id: object::id(loser),
            xp_gained: xp_gain
        });
    }
}