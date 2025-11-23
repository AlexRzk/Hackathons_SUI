module game::cim_currency {
    use std::string::{Self as string};
    use sui::coin_registry;
    use sui::transfer::public_transfer;

    /// One-Time Witness matching the module name.
    public struct CIM_CURRENCY has drop {}

    /// Initializes the CIM fungible token and hands the TreasuryCap to the deployer.
    fun init(witness: CIM_CURRENCY, ctx: &mut sui::tx_context::TxContext) {
        let (currency, treasury) = coin_registry::new_currency_with_otw(
            witness,
            9, // decimals
            string::utf8(b"CIM"),
            string::utf8(b"Cim Token"),
            string::utf8(b"Monnaie du jeu"),
            string::utf8(b"https://your-domain.example/icons/cim.png"),
            ctx
        );

        let metadata_cap = currency.finalize(ctx);
        public_transfer(metadata_cap, sui::tx_context::sender(ctx));
        public_transfer(treasury, sui::tx_context::sender(ctx));
    }
}