/// Evolution NFT Genesis Module
/// This module handles initialization, minting, and zkLogin verification for EvoNFT
module eggs_game::evo_genesis {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use std::string::{Self, String};
    use sui::url::{Self, Url};

    /// Error codes
    const E_INSUFFICIENT_PAYMENT: u64 = 1;
    const E_INVALID_LEVEL: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;
    const E_INVALID_RARITY: u64 = 4;

    /// NFT rarity levels
    const RARITY_COMMON: u8 = 0;
    const RARITY_RARE: u8 = 1;
    const RARITY_EPIC: u8 = 2;
    const RARITY_LEGENDARY: u8 = 3;

    /// Prices in MIST (1 SUI = 10^9 MIST)
    const PRICE_COMMON: u64 = 100_000_000;         // 0.1 SUI
    const PRICE_RARE: u64 = 500_000_000;           // 0.5 SUI
    const PRICE_EPIC: u64 = 1_000_000_000;         // 1.0 SUI
    const PRICE_LEGENDARY: u64 = 2_000_000_000;    // 2.0 SUI

    /// One-Time-Witness for creating the GenesisManager
    public struct EVO_GENESIS has drop {}

    /// GenesisManager: Shared object that holds authority to mint NFTs
    /// Similar to TreasuryCap pattern for coins
    public struct GenesisManager has key, store {
        id: UID,
        /// Total supply of NFTs minted
        total_minted: u64,
        /// Treasury address for collecting payments
        treasury: address,
        /// Whether minting is currently enabled
        minting_enabled: bool,
    }

    /// Evolution NFT - represents an egg/creature in the game
    public struct EvoNFT has key, store {
        id: UID,
        /// Owner of the NFT
        owner: address,
        /// Current evolution level (starts at 1)
        level: u64,
        /// Rarity tier (0-3: Common, Rare, Epic, Legendary)
        rarity: u8,
        /// DNA sequence for generating traits
        dna: vector<u8>,
        /// Name of the creature
        name: String,
        /// Description
        description: String,
        /// Image URL (can be updated as it evolves)
        image_url: Url,
        /// Seal Policy ID (for future use with Transfer Policy)
        seal_policy_id: Option<address>,
        /// Walrus Blob ID for decentralized storage
        walrus_blob_id: Option<String>,
        /// Timestamp of creation
        created_at: u64,
        /// Google account identifier (hashed for privacy)
        google_identity_hash: Option<vector<u8>>,
    }

    /// Events
    public struct GenesisManagerCreated has copy, drop {
        manager_id: object::ID,
        treasury: address,
    }

    public struct NFTMinted has copy, drop {
        nft_id: object::ID,
        owner: address,
        rarity: u8,
        level: u64,
        name: String,
    }

    public struct NFTEvolved has copy, drop {
        nft_id: object::ID,
        old_level: u64,
        new_level: u64,
    }

    /// Initialize function - called once when module is published
    /// Creates the GenesisManager shared object with OTW pattern
    fun init(otw: EVO_GENESIS, ctx: &mut TxContext) {
        // Create the GenesisManager as a shared object
        let treasury_addr = @0x0; // Replace with actual treasury address
        
        let manager = GenesisManager {
            id: object::new(ctx),
            total_minted: 0,
            treasury: treasury_addr,
            minting_enabled: true,
        };

        let manager_id = object::id(&manager);

        // Emit creation event
        event::emit(GenesisManagerCreated {
            manager_id,
            treasury: treasury_addr,
        });

        // Share the manager object so anyone can access it
        transfer::share_object(manager);
    }

    /// Mint Pod and NFT - Main minting function
    /// Called by user (via zkLogin) to buy an egg and mint an NFT
    /// 
    /// Parameters:
    /// - manager: Reference to the GenesisManager (shared object)
    /// - rarity: Desired rarity level (0-3)
    /// - payment: Coin<SUI> provided by the user
    /// - name: Name for the NFT
    /// - description: Description for the NFT
    /// - image_url: URL for the NFT image
    /// - ctx: Transaction context
    public entry fun mint_pod_and_nft(
        manager: &mut GenesisManager,
        rarity: u8,
        mut payment: Coin<SUI>,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &mut TxContext
    ) {
        // Verify minting is enabled
        assert!(manager.minting_enabled, E_UNAUTHORIZED);

        // Verify valid rarity
        assert_valid_rarity(rarity);

        // Get the price for this rarity
        let price = get_price(rarity);
        let payment_amount = coin::value(&payment);

        // Verify sufficient payment
        assert!(payment_amount >= price, E_INSUFFICIENT_PAYMENT);

        // Split the payment: exact price goes to treasury, rest returned to sender
        let payment_coin = coin::split(&mut payment, price, ctx);
        
        // Transfer payment to treasury
        transfer::public_transfer(payment_coin, manager.treasury);

        // Return change to sender
        let sender = tx_context::sender(ctx);
        if (coin::value(&payment) > 0) {
            transfer::public_transfer(payment, sender);
        } else {
            coin::destroy_zero(payment);
        };

        // Generate DNA (pseudo-random based on tx context and timestamp)
        let dna = generate_dna(ctx);

        // Create the EvoNFT
        let nft = EvoNFT {
            id: object::new(ctx),
            owner: sender,
            level: 1, // Start at level 1
            rarity,
            dna,
            name: string::utf8(name),
            description: string::utf8(description),
            image_url: url::new_unsafe_from_bytes(image_url),
            seal_policy_id: option::none(),
            walrus_blob_id: option::none(),
            created_at: tx_context::epoch(ctx),
            google_identity_hash: option::none(), // Will be set if zkLogin is verified
        };

        let nft_id = object::id(&nft);

        // Increment total minted
        manager.total_minted = manager.total_minted + 1;

        // Emit minting event
        event::emit(NFTMinted {
            nft_id,
            owner: sender,
            rarity,
            level: 1,
            name: nft.name,
        });

        // Transfer NFT to the sender
        transfer::public_transfer(nft, sender);
    }

    /// Verify zkLogin Identity
    /// Internal utility function to verify zkLogin authentication
    /// In production, this would verify the zkLogin signature and proof
    /// For now, it's a placeholder that returns true
    /// 
    /// zkLogin verification happens at the transaction level on Sui:
    /// - The transaction signature itself is a zkLogin signature
    /// - Sui validators verify the zero-knowledge proof
    /// - The tx_context::sender() is already authenticated via zkLogin
    /// 
    /// This function can optionally store the Google account hash for the NFT
    public fun verify_zklogin_identity(
        nft: &mut EvoNFT,
        google_account_hash: vector<u8>,
        _ctx: &TxContext
    ) {
        // In a real implementation, you would:
        // 1. Verify the zkLogin proof is valid
        // 2. Extract the Google sub (subject identifier) from the proof
        // 3. Hash it for privacy and store it
        
        // For now, we simply store the provided hash
        nft.google_identity_hash = option::some(google_account_hash);
    }

    // ==================== Helper Functions ====================

    /// Verify that the rarity value is valid
    fun assert_valid_rarity(rarity: u8) {
        assert!(
            rarity == RARITY_COMMON ||
            rarity == RARITY_RARE ||
            rarity == RARITY_EPIC ||
            rarity == RARITY_LEGENDARY,
            E_INVALID_RARITY
        );
    }

    /// Get the price for a given rarity
    public fun get_price(rarity: u8): u64 {
        assert_valid_rarity(rarity);
        if (rarity == RARITY_COMMON) {
            PRICE_COMMON
        } else if (rarity == RARITY_RARE) {
            PRICE_RARE
        } else if (rarity == RARITY_EPIC) {
            PRICE_EPIC
        } else {
            PRICE_LEGENDARY
        }
    }

    /// Generate pseudo-random DNA
    /// In production, consider using sui::random for better randomness
    fun generate_dna(ctx: &mut TxContext): vector<u8> {
        let sender = tx_context::sender(ctx);
        let epoch = tx_context::epoch(ctx);
        
        // Create a simple DNA sequence based on sender and epoch
        let mut dna = vector::empty<u8>();
        let sender_bytes = bcs::to_bytes(&sender);
        let epoch_bytes = bcs::to_bytes(&epoch);
        
        vector::append(&mut dna, sender_bytes);
        vector::append(&mut dna, epoch_bytes);
        
        dna
    }

    // ==================== Admin Functions ====================

    /// Update treasury address (only callable by current treasury)
    public entry fun update_treasury(
        manager: &mut GenesisManager,
        new_treasury: address,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == manager.treasury, E_UNAUTHORIZED);
        manager.treasury = new_treasury;
    }

    /// Toggle minting enabled/disabled
    public entry fun toggle_minting(
        manager: &mut GenesisManager,
        enabled: bool,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == manager.treasury, E_UNAUTHORIZED);
        manager.minting_enabled = enabled;
    }

    /// Update NFT metadata (owner only)
    public entry fun update_nft_metadata(
        nft: &mut EvoNFT,
        new_name: vector<u8>,
        new_description: vector<u8>,
        new_image_url: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(nft.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        nft.name = string::utf8(new_name);
        nft.description = string::utf8(new_description);
        nft.image_url = url::new_unsafe_from_bytes(new_image_url);
    }

    /// Set Seal Policy ID (for Transfer Policy integration)
    public entry fun set_seal_policy(
        nft: &mut EvoNFT,
        policy_id: address,
        ctx: &TxContext
    ) {
        assert!(nft.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        nft.seal_policy_id = option::some(policy_id);
    }

    /// Set Walrus Blob ID (for decentralized storage)
    public entry fun set_walrus_blob(
        nft: &mut EvoNFT,
        blob_id: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(nft.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        nft.walrus_blob_id = option::some(string::utf8(blob_id));
    }

    /// Evolve the NFT to next level
    public entry fun evolve(
        nft: &mut EvoNFT,
        ctx: &TxContext
    ) {
        assert!(nft.owner == tx_context::sender(ctx), E_UNAUTHORIZED);
        
        let old_level = nft.level;
        nft.level = nft.level + 1;

        event::emit(NFTEvolved {
            nft_id: object::id(nft),
            old_level,
            new_level: nft.level,
        });
    }

    // ==================== Getter Functions ====================

    public fun get_nft_level(nft: &EvoNFT): u64 { nft.level }
    public fun get_nft_rarity(nft: &EvoNFT): u8 { nft.rarity }
    public fun get_nft_dna(nft: &EvoNFT): &vector<u8> { &nft.dna }
    public fun get_nft_name(nft: &EvoNFT): &String { &nft.name }
    public fun get_nft_description(nft: &EvoNFT): &String { &nft.description }
    public fun get_nft_image_url(nft: &EvoNFT): &Url { &nft.image_url }
    public fun get_nft_owner(nft: &EvoNFT): address { nft.owner }
    public fun get_total_minted(manager: &GenesisManager): u64 { manager.total_minted }
    public fun is_minting_enabled(manager: &GenesisManager): bool { manager.minting_enabled }

    // Price getter functions for frontend
    public fun price_common(): u64 { PRICE_COMMON }
    public fun price_rare(): u64 { PRICE_RARE }
    public fun price_epic(): u64 { PRICE_EPIC }
    public fun price_legendary(): u64 { PRICE_LEGENDARY }
}
