// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { CONSTANTS, QueryKey } from "@/constants";
import { useTransactionExecution } from "@/hooks/useTransactionExecution";
import { Property } from "@/types/interface";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * A mutation to generate demo data as part of our demo.
 */
export function useMintNFTMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ property }: { property: Property }) => {
      if (!account?.address)
        throw new Error("You need to connect your wallet!");
      const txb = new Transaction();

      const nft = txb.moveCall({
        target: `${CONSTANTS.propertyContract.packageId}::property_nft::mint_nft`,
        arguments: [
          txb.pure.string(property.name),
          txb.pure.string(property.description),
          txb.pure.vector("u64", property.coordinates),
          txb.pure.vector("string", property.images),
          txb.pure.u64(property.area),
          txb.pure.u64(0),
          txb.object.clock(),
        ],
      });

      txb.transferObjects([nft], txb.pure.address(account.address));

      return executeTransaction(txb);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetOwnedObjects],
      });
    },
  });
}

export function useListNFTMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({
      object,
      price,
    }: {
      object: SuiObjectData;
      price: number;
    }) => {
      if (!account?.address)
        throw new Error("You need to connect your wallet!");
      const txb = new Transaction();

      txb.moveCall({
        target: `${CONSTANTS.propertyContract.packageId}::property_nft::list_nft`,
        arguments: [txb.object(object.objectId), txb.pure.u64(price)],
      });

      return executeTransaction(txb);
    },
  });
}

export function useUnlistNFTMutation() {
  const account = useCurrentAccount();
  const executeTransaction = useTransactionExecution();

  return useMutation({
    mutationFn: async ({ object }: { object: SuiObjectData }) => {
      if (!account?.address)
        throw new Error("You need to connect your wallet!");
      const txb = new Transaction();

      txb.moveCall({
        target: `${CONSTANTS.propertyContract.packageId}::property_nft::unlist_nft`,
        arguments: [txb.object(object.objectId)],
        typeArguments: [object.type!],
      });

      return executeTransaction(txb);
    },
  });
}
