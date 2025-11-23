# Evolution NFT Genesis Module - Implementation Documentation

## Overview

This module implements a comprehensive NFT minting system for the Evolving Eggs game on Sui blockchain with zkLogin integration support.

## Key Functions Implemented

### 1. `init` - Initialization (Module Initializer)

**Purpose**: Creates and publishes the `GenesisManager` shared object when the module is deployed.

**How it works**:
- Uses the One-Time-Witness (OTW) pattern with `EVO_GENESIS` struct
- Called automatically once during module publication by the Sui runtime
- Creates a `GenesisManager` shared object that holds minting authority
- Similar to `TreasuryCap` pattern used in coin modules

**Key features**:
- Sets up treasury address for payment collection
- Initializes minting counter at 0
- Enables minting by default
- Emits `GenesisManagerCreated` event
- Makes `GenesisManager` a shared object accessible by all users

**Code snippet**:
```move
fun init(otw: EVO_GENESIS, ctx: &mut TxContext) {
    let manager = GenesisManager {
        id: object::new(ctx),
        total_minted: 0,
        treasury: treasury_addr,
        minting_enabled: true,
    };
    transfer::share_object(manager);
}
```

### 2. `mint_pod_and_nft` - Buy Egg / Mint NFT

**Purpose**: Main minting function called by users (via zkLogin) to purchase and mint an EvoNFT.

**Parameters**:
- `manager`: Mutable reference to GenesisManager (shared object)
- `rarity`: Rarity level (0=Common, 1=Rare, 2=Epic, 3=Legendary)
- `payment`: Coin<SUI> provided by user's wallet
- `name`, `description`, `image_url`: NFT metadata
- `ctx`: Transaction context (contains sender info)

**How it works**:
1. **Validates** minting is enabled and rarity is valid
2. **Verifies payment** - checks user sent enough SUI for the rarity tier
3. **Processes payment**:
   - Splits exact price amount to treasury
   - Returns change to user if they overpaid
4. **Generates DNA** - creates pseudo-random DNA from tx context
5. **Creates EvoNFT** object with:
   - Unique ID
   - Level 1 (starting level)
   - Selected rarity
   - Generated DNA
   - User-provided metadata
   - Placeholder for zkLogin identity (optional)
6. **Updates state** - increments total_minted counter
7. **Emits event** - NFTMinted event with details
8. **Transfers NFT** - sends NFT to user (tx_context::sender())

**zkLogin Integration**:
- The `tx_context::sender()` is already authenticated via zkLogin signature
- Sui validators verify the zkLogin proof before executing the transaction
- No additional verification needed in the contract for basic authentication

**Code snippet**:
```move
public entry fun mint_pod_and_nft(
    manager: &mut GenesisManager,
    rarity: u8,
    mut payment: Coin<SUI>,
    // ... other params
    ctx: &mut TxContext
) {
    // Verify and process payment
    let price = get_price(rarity);
    assert!(coin::value(&payment) >= price, E_INSUFFICIENT_PAYMENT);
    
    // Create and transfer NFT
    let nft = EvoNFT { /* ... */ };
    transfer::public_transfer(nft, tx_context::sender(ctx));
}
```

### 3. `verify_zklogin_identity` - Access Control

**Purpose**: Optional function to link a Google account hash to an NFT for verified identity.

**How it works**:
- Takes mutable reference to an EvoNFT
- Accepts a `google_account_hash` (hashed Google sub identifier)
- Stores the hash in the NFT's `google_identity_hash` field

**zkLogin Context**:
On Sui, zkLogin verification happens at the transaction level:

1. **User logs in** with Google OAuth → gets JWT
2. **zkLogin wallet** generates:
   - Ephemeral key pair
   - Zero-knowledge proof from JWT
3. **Transaction signed** with ephemeral key + ZK proof
4. **Sui validators verify**:
   - Ephemeral signature is valid
   - ZK proof is valid against Google's JWK
   - Address matches OAuth identity
5. **Transaction executes** with authenticated sender

**In the contract**:
- `tx_context::sender()` is the zkLogin-derived address
- This address is cryptographically linked to the Google account
- For privacy, the actual Google `sub` is NOT revealed on-chain
- This function optionally stores a hash for later verification

**Use cases**:
- Linking NFT to a specific Google account
- Preventing account switching
- Creating verifiable on-chain identity
- Soulbound NFT implementation

**Code snippet**:
```move
public fun verify_zklogin_identity(
    nft: &mut EvoNFT,
    google_account_hash: vector<u8>,
    _ctx: &TxContext
) {
    // Store hashed Google identity for privacy
    nft.google_identity_hash = option::some(google_account_hash);
}
```

## Additional Features Implemented

### Admin Functions
- `update_treasury`: Change treasury address
- `toggle_minting`: Enable/disable minting
- `update_nft_metadata`: Update NFT name, description, image
- `set_seal_policy`: Set Transfer Policy ID
- `set_walrus_blob`: Set decentralized storage blob ID

### Evolution System
- `evolve`: Increment NFT level (can add requirements later)
- Emits `NFTEvolved` event

### Getter Functions
- View NFT attributes (level, rarity, DNA, metadata)
- View manager state (total minted, minting status)
- Get prices for each rarity tier

## Data Structures

### GenesisManager (Shared Object)
```move
public struct GenesisManager has key, store {
    id: UID,
    total_minted: u64,
    treasury: address,
    minting_enabled: bool,
}
```

### EvoNFT (Owned Object)
```move
public struct EvoNFT has key, store {
    id: UID,
    owner: address,
    level: u64,
    rarity: u8,
    dna: vector<u8>,
    name: String,
    description: String,
    image_url: Url,
    seal_policy_id: Option<address>,
    walrus_blob_id: Option<String>,
    created_at: u64,
    google_identity_hash: Option<vector<u8>>,
}
```

## Events

### GenesisManagerCreated
Emitted when module is initialized:
```move
public struct GenesisManagerCreated has copy, drop {
    manager_id: object::ID,
    treasury: address,
}
```

### NFTMinted
Emitted when a new NFT is minted:
```move
public struct NFTMinted has copy, drop {
    nft_id: object::ID,
    owner: address,
    rarity: u8,
    level: u64,
    name: String,
}
```

### NFTEvolved
Emitted when NFT levels up:
```move
public struct NFTEvolved has copy, drop {
    nft_id: object::ID,
    old_level: u64,
    new_level: u64,
}
```

## Pricing System

| Rarity | Level | Price (SUI) | Price (MIST) |
|--------|-------|-------------|--------------|
| Common | 0 | 0.1 | 100,000,000 |
| Rare | 1 | 0.5 | 500,000,000 |
| Epic | 2 | 1.0 | 1,000,000,000 |
| Legendary | 3 | 2.0 | 2,000,000,000 |

## Usage Flow

### 1. Module Deployment
```bash
sui client publish --gas-budget 100000000
```
- Automatically calls `init()` function
- Creates shared `GenesisManager` object
- Ready to mint NFTs

### 2. User Mints NFT (with zkLogin)
```typescript
// Frontend with zkLogin wallet
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::evo_genesis::mint_pod_and_nft`,
  arguments: [
    tx.object(GENESIS_MANAGER_ID),
    tx.pure(rarity), // 0-3
    tx.object(coinId), // SUI payment
    tx.pure(name),
    tx.pure(description),
    tx.pure(imageUrl),
  ],
});

// User signs with zkLogin (ephemeral key + ZK proof)
await signAndExecute({ transaction: tx });
```

### 3. Optional: Link Google Identity
```typescript
const googleHash = hashGoogleSub(googleSub);
tx.moveCall({
  target: `${packageId}::evo_genesis::verify_zklogin_identity`,
  arguments: [
    tx.object(nftId),
    tx.pure(googleHash),
  ],
});
```

## Security Considerations

1. **Payment Validation**: Always checks payment >= price
2. **Change Return**: Automatically returns overpayment to user
3. **Access Control**: Only NFT owner can modify their NFT
4. **Shared Object Safety**: GenesisManager is shared for concurrent access
5. **zkLogin Privacy**: Google identity is hashed, never revealed on-chain
6. **Treasury Protection**: Only current treasury can update treasury address

## Future Enhancements

1. **Random DNA**: Integrate `sui::random` for true randomness
2. **Evolution Requirements**: Add conditions for leveling up (payment, time, etc.)
3. **Transfer Policy**: Implement royalty/trading rules
4. **Walrus Integration**: Full decentralized storage support
5. **Breeding**: Combine two NFTs to create offspring
6. **Staking**: Stake NFTs for rewards
7. **Marketplace**: Direct listing/trading functions

## Testing

```bash
# Build the package
sui move build

# Run tests
sui move test

# Publish to testnet
sui client publish --gas-budget 100000000
```

## References

- [Sui Move Documentation](https://docs.sui.io/concepts/sui-move-concepts)
- [NFT Guide](https://docs.sui.io/guides/developer/nft)
- [zkLogin Documentation](https://docs.sui.io/concepts/cryptography/zklogin)
- [Module Initializers](https://move-book.com/programmability/module-initializer.html)
- [One-Time Witness Pattern](https://docs.sui.io/concepts/sui-move-concepts/one-time-witness)
