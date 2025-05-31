export enum QueryKey {
  PropertyNFT = "property_nft",
  GetOwnedObjects = "getOwnedObjects",
}

export const CONSTANTS = {
  propertyContract: {
    packageId:
      process.env.CONTRACT_ID ||
      "0x5644d957820c1f90b7c5951adc011d3c51e9c6217b5eaa719e0e233161814f09",
    propertyInfoType: `${process.env.CONTRACT_ID}::property_nft::PropertyInfo`,
    propertyNFTType: `${process.env.CONTRACT_ID}::property_nft::PropertyNFT`,
  },
};
