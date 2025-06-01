/// Module: property_nft
module properties::property_nft;

// For Move coding conventions, see
// https://docs.sui.io/concepts/sui-move-concepts/conventions

use std::string::{String, Self};
use sui::url::{Url, Self};
use sui::clock::Clock;
use sui::clock::timestamp_ms;
use sui::event;
use sui::sui::SUI;
use sui::coin::{Coin};

// Constants
const HOST: vector<u8> = b"https://aggregator.testnet.walrus.atalma.io/v1/blobs/";

// Structs
public struct PropertyInfo has key, store {
    id: UID,
    description: String,
    coordinates: vector<u64>, // [lat, lng]
    images: vector<String>,
    area: u64,
    created_at: u64,
    updated_at: u64
}

public struct PropertyNFT has key, store {
    id: UID,
    name: String,
    image_url: Url,
    property_info: PropertyInfo,
    owner: address,
    is_listed: bool,
    listing_price: u64,
}

// Errors
const ENotOwner: u64 = 0;
const ENotListed: u64 = 1;
const EListed: u64 = 2;
const EInvalidPrice: u64 = 3;
const EInsufficientFunds: u64 = 4;
const EInvalidImage: u64 = 5;

// Functions

public fun mint_nft(
    name: String,
    description: String,
    coordinates: vector<u64>,
    images: vector<String>,
    area: u64,
    clock: &Clock,
    ctx: &mut TxContext
): PropertyNFT {
    assert!(vector::length(&images) > 0, EInvalidImage);

    let property_info = PropertyInfo {
        id: object::new(ctx),
        description,
        coordinates,
        images,
        area,
        created_at: timestamp_ms(clock),
        updated_at: timestamp_ms(clock),
    };

    let mut image_url = HOST.to_string();

    if (vector::length(&images) > 0) {
        let first_image =         images.borrow(0);
        string::append(&mut image_url, *first_image);
    } else {
        string::append(&mut image_url, b"Hi".to_string());
    };

    let property_info_id = object::id(&property_info);
    
    let property_nft = PropertyNFT {
        id: object::new(ctx),
        name,
        image_url: url::new_unsafe_from_bytes(image_url.into_bytes()),
        property_info,
        owner: ctx.sender(),
        is_listed: false,
        listing_price: 0,
    };

    event::emit( NFTMinted {
        nft_id: object::id(&property_nft),
        owner: ctx.sender(),
        property_info: property_info_id,
    });

    property_nft
}

public fun list_nft(
    nft: &mut PropertyNFT,
    price: u64,
    ctx: &mut TxContext
) {
    assert!(nft.owner == ctx.sender(), ENotOwner);
    assert!(price > 0, EInvalidPrice);

    nft.is_listed = true;
    nft.listing_price = price;

    event::emit(NFTListed {
        nft_id: object::id(nft),
        owner: nft.owner,
        price,
    })
}

public fun unlist_nft(
    nft: &mut PropertyNFT,
    ctx: &mut TxContext
) {
    assert!(nft.owner == ctx.sender(), ENotOwner);
    assert!(nft.is_listed, ENotListed);

    nft.is_listed = false;
    nft.listing_price = 0;

    event::emit(NFTUnlisted {
        nft_id: object::id(nft),
        owner: nft.owner,
    });
}

public fun buy_nft(
    nft: &mut PropertyNFT,
    payment: &mut Coin<SUI>,
    ctx: &mut TxContext,
) {
    assert!(nft.is_listed, ENotListed);
    assert!(payment.value() >= nft.listing_price, EInsufficientFunds);

    let seller = nft.owner;
    let price = nft.listing_price;
    let payment_coin: Coin<SUI> = payment.split(price, ctx);

    transfer::public_transfer(payment_coin, seller);

    nft.owner = ctx.sender();
    nft.is_listed = false;
    nft.listing_price = 0;

    event::emit(NFTPurchased {
        nft_id: object::id(nft),
        buyer: ctx.sender(),
        seller,
        price,
    })
}

public fun transfer_nft(
    nft: &mut PropertyNFT,
    recipient: address,
    ctx: &mut TxContext,
) {
    assert!(!nft.is_listed, EListed);

    nft.owner = recipient;

    event::emit(NFTTransferred {
        nft_id: object::id(nft),
        from: ctx.sender(),
        to: recipient,
    })
}

// Events
public struct NFTMinted has copy, drop {
    nft_id: ID,
    owner: address,
    property_info: ID
}

public struct NFTTransferred has copy, drop {
    nft_id: ID,
    from: address,
    to: address
}

public struct NFTPurchased has copy, drop {
    nft_id: ID,
    buyer: address,
    seller: address,
    price: u64
}

public struct NFTListed has copy, drop {
    nft_id: ID,
    owner: address,
    price: u64
}

public struct NFTUnlisted has copy, drop {
    nft_id: ID,
    owner: address
}