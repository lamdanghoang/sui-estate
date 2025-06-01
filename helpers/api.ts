export const storeImageFile = async (file: File): Promise<string> => {
  const url = `${process.env.NEXT_PUBLIC_PUBLISHER}/v1/blobs?epochs=2`;

  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    mode: "cors",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Server responded with ${response.status}`
    );
  }

  const data = await response.json();
  console.log("Blob stored:", data);

  // Handle different result variants
  if (data.newlyCreated) {
    // If the blob was just created
    return data.newlyCreated.blobObject.blobId;
  } else if (data.alreadyCertified) {
    // If the blob already exists and is certified
    return data.alreadyCertified.blobId;
  } else if (data.markedInvalid) {
    throw new Error("Blob was marked invalid");
  }
  throw new Error(data.error.error_msg);
};

export const getPropertyNFTs = async () => {
  const url = `http://localhost:3000/nfts?is_listed=true`;
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch nfts");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nfts:", error);
    throw error;
  }
};
