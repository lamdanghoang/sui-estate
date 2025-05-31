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
