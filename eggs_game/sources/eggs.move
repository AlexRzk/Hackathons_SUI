module eggs_game::eggs {
    use sui::object::{Self as object, UID};
    use sui::tx_context::{Self as tx_context, TxContext};
    use sui::coin::{Self as coin, Coin};
    use sui::sui::SUI;
    use sui::transfer;

    /// Codes d'erreur
    const E_INVALID_RARITY: u64 = 1;
    const E_INSUFFICIENT_PAYMENT: u64 = 2;

    /// Raretés
    const RARITY_COMMON: u8 = 0;
    const RARITY_RARE: u8 = 1;
    const RARITY_EPIC: u8 = 2;
    const RARITY_LEGENDARY: u8 = 3;

    /// Prix en MIST (1 SUI = 10^9)
    const PRICE_COMMON: u64 = 100_000_000;         // 0.1 SUI
    const PRICE_RARE: u64 = 500_000_000;           // 0.5 SUI
    const PRICE_EPIC: u64 = 1_000_000_000;         // 1   SUI
    const PRICE_LEGENDARY: u64 = 2_000_000_000;    // 2   SUI

    /// NFT pour un oeuf (les stats seront calculées côté front dans la V0)
    public struct EggNFT has key, store {
        id: UID,
        owner: address,
        rarity: u8,
    }

    /// Vérifie que la rareté est valide
    fun assert_valid_rarity(rarity: u8) {
        let ok =
            rarity == RARITY_COMMON ||
            rarity == RARITY_RARE ||
            rarity == RARITY_EPIC ||
            rarity == RARITY_LEGENDARY;
        assert!(ok, E_INVALID_RARITY);
    }

    /// Retourne le prix d'une rareté donnée
    public fun get_price(rarity: u8): u64 {
        assert_valid_rarity(rarity);
        if (rarity == RARITY_COMMON) {
            PRICE_COMMON
        } else if (rarity == RARITY_RARE) {
            PRICE_RARE
        } else if (rarity == RARITY_EPIC) {
            PRICE_EPIC
        } else {
            // Ici on sait que c'est LEGENDARY grâce au assert_valid_rarity
            PRICE_LEGENDARY
        }
    }

    /// Achat d'un oeuf.
    /// - `rarity` : 0 = common, 1 = rare, 2 = epic, 3 = legendary
    /// - `payment` : Coin<SUI> fourni par le wallet, peut être > prix
    ///   On rend le "change" au joueur.
    public entry fun buy_egg(
        rarity: u8,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert_valid_rarity(rarity);

        let mut payment = payment;
        let price = get_price(rarity);
        let amount = coin::value(&payment);

        // Vérifie qu'il y a assez de SUI
        assert!(amount >= price, E_INSUFFICIENT_PAYMENT);

        // On coupe la coin en [prix] + [change]
        let to_treasury = coin::split(&mut payment, price, ctx);

        // Adresse qui reçoit les fonds (à changer par la tienne si tu veux)
        let buyer_addr = tx_context::sender(ctx);
        let treasury_addr = @0x0;
        transfer::public_transfer(to_treasury, treasury_addr);

        // On rend le change à l'acheteur
        transfer::public_transfer(payment, buyer_addr);

        // Mint de l'EggNFT
        let egg = EggNFT {
            id: object::new(ctx),
            owner: buyer_addr,
            rarity,
        };

        // Transfert du NFT au joueur
        transfer::public_transfer(egg, buyer_addr);
    }

    /// Helpers pour que le front puisse lire les prix si besoin
    public fun price_for_common(): u64 { PRICE_COMMON }
    public fun price_for_rare(): u64 { PRICE_RARE }
    public fun price_for_epic(): u64 { PRICE_EPIC }
    public fun price_for_legendary(): u64 { PRICE_LEGENDARY }
}
