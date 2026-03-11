import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadScrapImage = async (
  userId: string, 
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file) throw new Error("No file provided");
  
  const ext = file.name.split('.').pop() || 'jpeg';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${ext}`;
  const storageRef = ref(storage, `listings/${userId}/${filename}`);
  
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed', 
      (snapshot) => {
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        }
      },
      (error) => {
        console.error("Storage upload error:", error);
        reject(new Error(`Image upload failed: ${error.message}`));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch {
          reject(new Error("Failed to retrieve image URL after upload."));
        }
      }
    );
  });
};

export const deleteScrapImage = async (url: string): Promise<void> => {
  if (!url) return;
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error: unknown) {
    console.error("Failed to delete image from storage:", error);
    throw new Error("Could not delete image from server.");
  }
};
