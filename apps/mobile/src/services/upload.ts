import { API_URL } from './api';
import { getIdToken } from './firebaseAuth';

export async function uploadImage(localUri: string, fileName = 'photo.jpg'): Promise<string> {
  const token = await getIdToken();
  if (!token) throw new Error('Not authenticated');

  const formData = new FormData();
  formData.append('image', {
    uri: localUri,
    name: fileName,
    type: 'image/jpeg',
  } as unknown as Blob);

  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.url as string;
}
