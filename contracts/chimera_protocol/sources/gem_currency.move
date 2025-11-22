module game::gem_currency {
    use std::option;
    use sui::coin;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // Le One Time Witness (doit avoir le même nom que le module en majuscules)
    struct GEM_CURRENCY has drop {}

    // Initialisation du token
    fun init(witness: GEM_CURRENCY, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness, 
            9, // Décimales
            b"GEM", // Symbole
            b"Gem Token", // Nom
            b"Monnaie du jeu", // Description
            option::none(), // Url de l'icone
            ctx
        );

        // On gèle les métadonnées (elles ne changeront plus)
        transfer::public_freeze_object(metadata);

        // On envoie la capacité de "mint" (trésorerie) au créateur
        transfer::public_transfer(treasury, tx_context::sender(ctx));
    }
}