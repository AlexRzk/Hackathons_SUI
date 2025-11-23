module chimera::genesis_manager {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use chimera::evolution_nft::{Self, EvoNFT};

    public struct GenesisCap has key, store {
        id: UID,
    }

    public struct EggMinted has copy, drop {
        egg_id: object::ID,
        owner: address,
    }

    fun init(ctx: &mut TxContext) {
        transfer::transfer(GenesisCap {
            id: object::new(ctx),
        }, tx_context::sender(ctx));
    }

    public fun mint_egg(_cap: &GenesisCap, dna: vector<u8>, ctx: &mut TxContext) {
        let egg = evolution_nft::mint(dna, ctx);
        let egg_id = object::id(&egg);
        let owner = tx_context::sender(ctx);

        event::emit(EggMinted {
            egg_id,
            owner,
        });

        transfer::public_transfer(egg, owner);
    }

    // Placeholder for zkLogin verification
    // In a real scenario, this would verify the zkLogin signature or address
    public fun verify_zklogin(_ctx: &TxContext): bool {
        true
    }
}
