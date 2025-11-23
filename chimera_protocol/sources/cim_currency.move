module game::cim_currency {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self as tx_context, TxContext};

    /// One-Time Witness matching the module name.
    public struct CIM_CURRENCY has drop {}

    /// Initializes the CIM fungible token and hands the TreasuryCap to the deployer.
    public entry fun init(witness: CIM_CURRENCY, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,                // decimals
            b"CIM",           // symbol
            b"Cim Token",     // name
            b"Monnaie du jeu",// description
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}