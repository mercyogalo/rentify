import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { API_URL } from './api';
import { getIdToken } from './firebaseAuth';

export async function pickProfileImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access your photos is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

function guessFileName(localUri: string, fallback = 'photo.jpg'): string {
  if (localUri.startsWith('data:image/png')) return 'photo.png';
  if (localUri.startsWith('data:image/webp')) return 'photo.webp';
  const match = localUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  if (match?.[1]) return `photo.${match[1].toLowerCase()}`;
  return fallback;
}

async function appendImageToFormData(
  formData: FormData,
  localUri: string,
  fileName: string
): Promise<void> {
  if (Platform.OS === 'web') {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const type = blob.type || 'image/jpeg';
    const name = fileName.includes('.') ? fileName : `${fileName}.jpg`;
    formData.append('image', blob, name);
    return;
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  const type =
    ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

  formData.append('image', {
    uri: localUri,
    name: fileName,
    type,
  } as unknown as Blob);
}

export async function uploadImage(
  localUri: string,
  fileName?: string,
  token?: string
): Promise<string> {
  const authToken = token ?? (await getIdToken());
  if (!authToken) throw new Error('Not authenticated');

  const resolvedName = fileName || guessFileName(localUri);
  const formData = new FormData();
  await appendImageToFormData(formData, localUri, resolvedName);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}
