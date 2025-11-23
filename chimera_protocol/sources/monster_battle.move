module game::monster_battle {
    use game::monster_hatchery;
    use game::monster_hatchery::Monster;
    use sui::event;
    use sui::object::{Self as object, ID, UID};
    use sui::tx_context::{Self as tx_context, TxContext};
    use sui::transfer;

    const ENotAuthorized: u64 = 999;

    /// Shared object storing the authority allowed to settle battles (TEE / backend).
    public struct BattleConfig has key {
        id: UID,
        tee_address: address
    }

    /// Event informing indexers/UI about battle results.
    public struct BattleEvent has copy, drop {
        winner_id: ID,
        loser_id: ID,
        xp_gained: u64
    }

    public entry fun init(ctx: &mut TxContext) {
        transfer::share_object(BattleConfig {
            id: object::new(ctx),
            tee_address: tx_context::sender(ctx)
        });
    }

    /// Can only be invoked by the trusted executor; updates stats and emits an event.
    public entry fun settle_battle(
        config: &BattleConfig,
        winner: &mut Monster,
        loser: &Monster,
        xp_gain: u64,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == config.tee_address, ENotAuthorized);
        monster_hatchery::update_stats_after_battle(winner, xp_gain);

        event::emit(BattleEvent {
            winner_id: object::id(winner),
            loser_id: object::id(loser),
            xp_gained: xp_gain
        });
    }
}