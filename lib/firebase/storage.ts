import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './config'

function requireStorage() {
  if (!storage) throw new Error('Firebase Storage is not initialized')
  return storage
}

/**
 * Upload a file to Firebase Storage
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'products/image.jpg')
 * @returns The download URL of the uploaded file
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(requireStorage(), path)
  await uploadBytes(storageRef, file)
  return await getDownloadURL(storageRef)
}

/**
 * Delete a file from Firebase Storage
 * @param path - The storage path of the file to delete
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(requireStorage(), path)
  await deleteObject(storageRef)
}

/**
 * Get the storage path from a download URL
 * @param url - The Firebase Storage download URL
 * @returns The storage path or null if not a Firebase Storage URL
 */
export function getStoragePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    // Firebase Storage URLs have a specific pattern
    // Extract the path from the URL
    const match = urlObj.pathname.match(/\/o\/(.+)\?/)
    if (match) {
      return decodeURIComponent(match[1])
    }
    return null
  } catch {
    return null
  }
}

