module game::gem_currency {
    use sui::coin;
    
    
    // Le One Time Witness (doit avoir le même nom que le module en majuscules)
    public struct GEM_CURRENCY has drop {}

    // Initialisation du token
    #[allow(deprecated_usage)]
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