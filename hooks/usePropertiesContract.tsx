"use client";
import { CONSTANTS } from "@/constants";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { SuiObjectChange } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

const MODULE_ADDRESS = CONSTANTS.propertyContract.packageId;
const MODULE_NAME = "property_nft";

// Helper function to get the full module ID
const getModuleId = () => `${MODULE_ADDRESS}::${MODULE_NAME}`;

export const useMintNFT = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [createdObjectId, setCreatedObjectId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_mint = async ({
    name,
    description,
    coordinates,
    images,
    area,
  }: {
    name: string;
    description: string;
    coordinates: [number, number];
    images: string[];
    area: number;
  }) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setCreatedObjectId("");
    setDigest("");

    if (!account?.address) throw new Error("You need to connect your wallet!");

    console.log("=== Minting NFT Started ===");

    try {
      // Format values
      const coorFormatted = coordinates.map((coor) => toSuiU64(coor));
      const formattedArea = toSuiU64(area);

      console.log("Formatted values:", {
        coorFormatted,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      const nft = txb.moveCall({
        target: `${getModuleId()}::mint_nft`,
        arguments: [
          txb.pure.string(name),
          txb.pure.string(description),
          txb.pure.vector("u64", coorFormatted),
          txb.pure.vector("string", images),
          txb.pure.u64(formattedArea),
          txb.object.clock(),
        ],
      });

      txb.transferObjects([nft], txb.pure.address(account.address));

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);

                // Find created objects
                const createdObjects = txResponse.objectChanges.filter(
                  (change) => change.type === "created"
                );

                if (createdObjects.length > 0) {
                  const newObjectId = createdObjects[0].objectId;
                  console.log("Created object ID:", newObjectId);
                  setCreatedObjectId(newObjectId);

                  // Optional: Get more details about the created object
                  try {
                    const objectInfo = await suiClient.getObject({
                      id: newObjectId,
                      options: { showContent: true },
                    });
                    console.log("Created object details:", objectInfo);
                  } catch (objError) {
                    console.warn("Could not fetch object details");
                  }
                } else {
                  console.log("No objects were created in this transaction");
                }
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== NFT Creation Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_mint,
    digest,
    createdObjectId,
    objectChanges,
    isLoading,
    error,
  };
};

export const useListNFT = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_list = async (nftId: string, price: number) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setDigest("");

    console.log("=== Listing Transaction Started ===");

    try {
      // Format values
      const formattedPrice = toSuiU64(price);

      console.log("Formatted values:", {
        nftId,
        formattedPrice,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::list_nft`,
        arguments: [txb.object(nftId), txb.pure.u64(formattedPrice)],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Listing NFT Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_list,
    digest,
    objectChanges,
    isLoading,
    error,
  };
};

export const useUnlistNFT = () => {
  const [digest, setDigest] = useState<string>("");
  const [objectChanges, setObjectChanges] = useState<SuiObjectChange[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const account = useCurrentAccount();

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const sign_to_unlist = async (nftId: string) => {
    // Reset states
    setError(null);
    setIsLoading(true);
    setObjectChanges([]);
    setDigest("");

    console.log("=== Unlisting Transaction Started ===");

    try {
      console.log("Formatted values:", {
        nftId,
        moduleId: getModuleId(),
      });

      const txb = new Transaction();

      console.log("Creating transaction block...");

      // Build the transaction
      txb.moveCall({
        target: `${getModuleId()}::unlist_nft`,
        arguments: [txb.object(nftId)],
      });

      console.log("Transaction block created, signing and executing...");

      // Execute the transaction
      signAndExecuteTransaction(
        { transaction: txb },
        {
          onSuccess: async (result) => {
            console.log("Initial transaction execution successful");
            console.log("Transaction digest:", result.digest);
            setDigest(result.digest);

            try {
              console.log("Waiting for transaction confirmation...");
              const txResponse = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                  showEffects: true,
                  showEvents: true,
                  showObjectChanges: true,
                },
              });

              console.log("Transaction confirmed");

              // Full response logging for debugging (commented out for production)
              // console.log("Full transaction response:", JSON.stringify(txResponse, null, 2));

              // Check status safely
              const txStatus = txResponse.effects?.status?.status;
              console.log("Transaction status:", txStatus);

              if (txStatus !== "success") {
                const errorMessage =
                  txResponse.effects?.status?.error || "Unknown error";
                console.error("Transaction failed with status:", errorMessage);
                throw new Error(`Transaction failed: ${errorMessage}`);
              }

              // Process object changes
              if (
                Array.isArray(txResponse.objectChanges) &&
                txResponse.objectChanges.length > 0
              ) {
                console.log(
                  `Found ${txResponse.objectChanges.length} object changes`
                );
                setObjectChanges(txResponse.objectChanges);
              } else {
                console.log("No object changes in transaction response");
              }

              console.log("=== Unlisting NFT Complete ===");
            } catch (confirmError) {
              console.error("Error confirming transaction:", confirmError);
              setError(new Error(`Transaction confirmation failed`));
            } finally {
              setIsLoading(false);
            }
          },
          onError: (execError) => {
            console.error("Transaction execution failed:", execError);
            setError(
              new Error(`Failed to execute transaction: ${execError.message}`)
            );
            setIsLoading(false);
          },
        }
      );
    } catch (setupError) {
      console.error("Error setting up transaction:", setupError);
      setError(new Error(`Transaction setup failed: `));
      setIsLoading(false);
    }
  };

  return {
    sign_to_unlist,
    digest,
    objectChanges,
    isLoading,
    error,
  };
};

export interface FieldProps {
  id: string;
  blob_id: string;
  creator: string;
  goal: bigint;
  raised: bigint;
  balance: bigint;
  duration: number;
  deadline: number;
  admin: string;
  status: number;
  quorum_percentage: number;
  contributors: Map<string, number>;
  milestones: Map<bigint, boolean>;
  milestone_amounts: Map<bigint, bigint>;
  milestone_votes: Map<bigint, Map<string, boolean>>;
  milestone_vote_weights: Map<bigint, bigint>;
  released_milestones: Map<bigint, boolean>;
}

export interface PropertyInfo {
  id: string;
  description: string;
  coordinates: [number, number];
  images: string[];
  area: number;
  price: number;
  created_at: number;
  updated_at: number;
}

export interface NFTFieldProps {
  id: string;
  name: string;
  image_url: string;
  property_info: PropertyInfo;
  owner: string;
  is_listed: boolean;
  listing_price: number;
}

export const useGetNft = () => {
  const suiClient = useSuiClient();

  // Function with extensive debugging added
  const get_nft_fields = async (objectId: string) => {
    try {
      const object = await suiClient.getObject({
        id: objectId,
        options: {
          showContent: true,
        },
      });
      const content = object.data?.content;

      if (content && content.dataType === "moveObject") {
        const fields = content.fields as Record<string, any>;

        // Parse property_info nested object
        const propertyInfoFields =
          fields.property_info?.fields || fields.property_info || {};

        const propertyInfo: PropertyInfo = {
          id: propertyInfoFields.id?.id || propertyInfoFields.id || "",
          description: propertyInfoFields.description || "",
          coordinates: Array.isArray(propertyInfoFields.coordinates)
            ? propertyInfoFields.coordinates.map((coord: any) =>
                fromSuiU64(BigInt(coord))
              )
            : [],
          images: Array.isArray(propertyInfoFields.images)
            ? propertyInfoFields.images
            : [],
          area: propertyInfoFields.area
            ? fromSuiU64(BigInt(propertyInfoFields.area))
            : 0,
          price: propertyInfoFields.price
            ? fromSuiU64(BigInt(propertyInfoFields.price))
            : 0,
          created_at: Number(propertyInfoFields.created_at) || 0,
          updated_at: Number(propertyInfoFields.updated_at) || 0,
        };

        const parsed: NFTFieldProps = {
          id: fields.id?.id || fields.id || objectId,
          name: fields.name || "",
          image_url:
            typeof fields.image_url === "string"
              ? fields.image_url
              : fields.image_url?.url || "",
          property_info: propertyInfo,
          owner: fields.owner || "",
          is_listed: Boolean(fields.is_listed),
          listing_price: fields.listing_price
            ? fromSuiU64(BigInt(fields.listing_price))
            : 0,
        };

        console.log("Parsed Fields:", parsed);
        return parsed;
      } else {
        console.error("Not moveObject or Object has no content.");
        return null;
      }
    } catch (setupError) {
      console.error("Error getting fields:", setupError);
    }
  };

  const get_all_nfts = async (address: string): Promise<NFTFieldProps[]> => {
    try {
      const resp = await suiClient.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${MODULE_ADDRESS}::${MODULE_NAME}::PropertyNFT`,
        },
        options: {
          showType: true,
          showContent: true,
        },
      });

      const nftObjects = resp.data ?? [];

      const allNfts = await Promise.all(
        nftObjects.map(async (obj) => {
          const id = obj.data?.objectId;
          if (id) {
            return await get_nft_fields(id);
          }
          return null;
        })
      );

      return allNfts.filter((nft): nft is NFTFieldProps => nft !== null);
    } catch (error) {
      console.error("Error fetching user FundX NFTs:", error);
      return [];
    }
  };

  return {
    get_nft_fields,
    get_all_nfts,
  };
};

// Safer formatting functions
export function toSuiU64(amount: number): string {
  if (isNaN(amount) || amount < 0) {
    throw new Error(`Invalid SUI amount: ${amount}`);
  }

  try {
    const scaled = BigInt(Math.floor(amount * 1e9));
    return scaled.toString();
  } catch (error) {
    throw new Error(`Error converting ${amount} to SUI U64:`);
  }
}

export function fromSuiU64(u64BigInt: bigint): number {
  try {
    const result = Number(u64BigInt) / 1e9;
    return result;
  } catch (error) {
    throw new Error(`Error converting ${u64BigInt} from SUI U64:`);
  }
}
