module game::monster_battle {
    use game::monster_hatchery;
    use game::monster_hatchery::Monster;
    use sui::event;
    use sui::transfer::share_object;

    const ENotAuthorized: u64 = 999;

    /// Shared object storing the authority allowed to settle battles (TEE / backend).
    public struct BattleConfig has key {
        id: sui::object::UID,
        tee_address: address
    }

    /// Event informing indexers/UI about battle results.
    public struct BattleEvent has copy, drop {
        winner_id: sui::object::ID,
        loser_id: sui::object::ID,
        xp_gained: u64
    }

    fun init(ctx: &mut sui::tx_context::TxContext) {
        share_object(BattleConfig {
            id: sui::object::new(ctx),
            tee_address: sui::tx_context::sender(ctx)
        });
    }

    /// Can only be invoked by the trusted executor; updates stats and emits an event.
    public fun settle_battle(
        config: &BattleConfig,
        winner: &mut Monster,
        loser: &Monster,
        xp_gain: u64,
        ctx: &mut sui::tx_context::TxContext
    ) {
        assert!(sui::tx_context::sender(ctx) == config.tee_address, ENotAuthorized);
        monster_hatchery::update_stats_after_battle(winner, xp_gain);

        event::emit(BattleEvent {
            winner_id: sui::object::id(winner),
            loser_id: sui::object::id(loser),
            xp_gained: xp_gain
        });
    }
}