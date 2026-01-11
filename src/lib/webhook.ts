const WEBHOOK_URL = 'https://plex.app.n8n.cloud/webhook/for-kirsten';

export async function sendFileToWebhook(file: File, type: string, name?: string, relationship?: string): Promise<void> {
  console.log('[Webhook] Sending file:', file.name);

  const metadata: Record<string, unknown> = {
    type,
    timestamp: new Date().toISOString(),
    file_only: true,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    name: name || 'Unknown',
    relationship: relationship || '',
  };

  const formData = new FormData();
  formData.append('attachment', file, file.name);
  formData.append('metadata', JSON.stringify(metadata));

  console.log('[Webhook] File metadata:', metadata);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('[Webhook] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.error('[Webhook] Error response:', text);
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('[Webhook] File sent successfully!');
  } catch (error) {
    console.error('[Webhook] Fetch error:', error);
    throw error;
  }
}
