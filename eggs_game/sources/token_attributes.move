module chimera::int {
    use sui::coin::{Self, TreasuryCap};
    use std::option;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct INT has drop {}

    fun init(witness: INT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"INT", 
            b"Intelligence", 
            b"Intelligence Token", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}

module chimera::pow {
    use sui::coin::{Self, TreasuryCap};
    use std::option;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct POW has drop {}

    fun init(witness: POW, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"POW", 
            b"Power", 
            b"Power Token", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}

module chimera::agi {
    use sui::coin::{Self, TreasuryCap};
    use std::option;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    public struct AGI has drop {}

    fun init(witness: AGI, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, 
            b"AGI", 
            b"Agility", 
            b"Agility Token", 
            option::none(), 
            ctx
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}

module chimera::token_attributes {
    // This module can manage the tokens or provide utility functions
    use chimera::int::INT;
    use chimera::pow::POW;
    use chimera::agi::AGI;
    use sui::coin::Coin;

    public struct TokenContainer has key, store {
        id: sui::object::UID,
        int_balance: Coin<INT>,
        pow_balance: Coin<POW>,
        agi_balance: Coin<AGI>,
    }
}
