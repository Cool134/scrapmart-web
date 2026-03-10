import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadScrapImage = async (userId: string, file: File, onProgress?: (p: number) => void): Promise<string> => {
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const storageRef = ref(storage, `listings/${userId}/${filename}`);
  
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed', 
      (snapshot) => {
        if (onProgress) {
          onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        }
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

export const deleteScrapImage = async (url: string) => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (e) {
    console.error("Failed to delete image", e);
  }
};
