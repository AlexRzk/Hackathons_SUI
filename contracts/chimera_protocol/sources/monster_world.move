module game::monster_world {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::url::{Self, Url};
    use std::string::{Self, String};
    
    // Import de notre module de monnaie (supposons qu'ils sont dans le même package)
    use game::gem_currency::GEM_CURRENCY;

    // --- Constantes ---
    const ENotEnoughMoney: u64 = 0;
    const MONSTER_PRICE: u64 = 100; // Prix fixe pour l'exemple

    // --- Structs (Les Objets) ---

    // Notre NFT évolutif
    struct Monster has key, store {
        id: UID,
        name: String,
        strength: u64,
        agility: u64,
        intelligence: u64,
        level: u8,
        img_url: Url,
    }

    // La boutique (Objet partagé qui stocke les gains)
    struct Shop has key {
        id: UID,
        profits: Balance<GEM_CURRENCY>
    }

    // --- Initialisation ---
    
    fun init(ctx: &mut TxContext) {
        // On crée la boutique et on la partage pour que tout le monde puisse interagir avec
        let shop = Shop {
            id: object::new(ctx),
            profits: balance::zero()
        };
        transfer::share_object(shop);
    }

    // --- Fonctions Publiques (Jouables) ---

    // 1. Acheter un Monstre
    public entry fun buy_monster(
        shop: &mut Shop, 
        payment: &mut Coin<GEM_CURRENCY>, 
        name: vector<u8>, 
        img_url: vector<u8>, 
        ctx: &mut TxContext
    ) {
        // Vérifier que le joueur a assez d'argent dans la pièce fournie
        assert!(coin::value(payment) >= MONSTER_PRICE, ENotEnoughMoney);

        // Prélever le paiement
        let coin_paid = coin::split(payment, MONSTER_PRICE, ctx);
        balance::join(&mut shop.profits, coin::into_balance(coin_paid));

        // Créer le monstre (NFT)
        let monster = Monster {
            id: object::new(ctx),
            name: string::utf8(name),
            strength: 10, // Stats de base
            agility: 10,
            intelligence: 10,
            level: 1,
            img_url: url::new_unsafe_from_bytes(img_url)
        };

        // Envoyer le monstre à l'acheteur
        transfer::transfer(monster, tx_context::sender(ctx));
    }

    // 2. Faire évoluer (Entraîner) le monstre
    // Seul le propriétaire du monstre peut appeler cette fonction
    public entry fun train_monster(monster: &mut Monster) {
        monster.level = monster.level + 1;
        
        // Logique simple : Augmentation aléatoire ou fixe des stats
        monster.strength = monster.strength + 2;
        monster.agility = monster.agility + 1;
        monster.intelligence = monster.intelligence + 1;

        // Ici, on pourrait ajouter une logique pour changer l'img_url 
        // si le monstre atteint le niveau 10 (Evolution visuelle)
    }
    
    // 3. Récupérer les profits (Admin seulement)
    // Note: Dans un vrai jeu, il faudrait une AdminCap pour protéger cette fonction
    public fun collect_profits(shop: &mut Shop, ctx: &mut TxContext): Coin<GEM_CURRENCY> {
        let amount = balance::value(&shop.profits);
        coin::take(&mut shop.profits, amount, ctx)
    }
}