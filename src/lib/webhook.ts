import { Recording } from '@/types/voice-capture';

const WEBHOOK_URL = 'https://plex.app.n8n.cloud/webhook/voice-idea';

export async function sendToWebhook(recording: Recording, audioBlob: Blob, attachedFile?: File): Promise<void> {
  console.log('[Webhook] Starting send to:', WEBHOOK_URL);

  const metadata: Record<string, unknown> = {
    type: recording.type,
    timestamp: recording.timestamp,
    duration: recording.duration,
  };

  // Add type-specific fields
  if (recording.type === 'meeting' && recording.agenda) {
    metadata.agenda = recording.agenda;
  }
  if (recording.type === 'skill_update' && recording.skillTarget) {
    metadata.skill_target = recording.skillTarget;
  }
  if (recording.type === 'project_research') {
    if (recording.projectType) {
      metadata.project_type = recording.projectType;
    }
    if (recording.projectType === 'new_project' && recording.projectName) {
      metadata.project_name = recording.projectName;
    }
  }

  // Add attached file info to metadata
  if (attachedFile) {
    metadata.attached_file_name = attachedFile.name;
    metadata.attached_file_type = attachedFile.type;
    metadata.attached_file_size = attachedFile.size;
  }

  console.log('[Webhook] Metadata:', metadata);

  const formData = new FormData();
  formData.append('audio', audioBlob, `recording-${recording.id}.webm`);
  formData.append('metadata', JSON.stringify(metadata));
  
  // Append attached file if present
  if (attachedFile) {
    formData.append('attachment', attachedFile, attachedFile.name);
  }

  console.log('[Webhook] Sending request...');

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

    console.log('[Webhook] Success!');
  } catch (error) {
    console.error('[Webhook] Fetch error:', error);
    throw error;
  }
}

// Send file only (no audio)
export async function sendFileToWebhook(file: File, type: string): Promise<void> {
  console.log('[Webhook] Sending file only:', file.name);

  const metadata: Record<string, unknown> = {
    type,
    timestamp: new Date().toISOString(),
    file_only: true,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
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
