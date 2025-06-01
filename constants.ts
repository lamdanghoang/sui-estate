export enum QueryKey {
  PropertyNFT = "property_nft",
  GetOwnedObjects = "getOwnedObjects",
}

export const CONSTANTS = {
  propertyContract: {
    packageId:
      process.env.CONTRACT_ID ||
      "0x7f10901f1d00d8a3d27de000a97751671f139d8763f6cd6f0a6cd61884564a23",
    propertyInfoType: `${process.env.CONTRACT_ID}::property_nft::PropertyInfo`,
    propertyNFTType: `${process.env.CONTRACT_ID}::property_nft::PropertyNFT`,
  },
};
