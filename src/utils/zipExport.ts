import JSZip from 'jszip';
import { GeneratedFile } from '../types/generator';

export async function downloadProjectZip(projectName: string, files: GeneratedFile[]): Promise<void> {
  const zip = new JSZip();
  const folderName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'fastapi-backend';

  const rootFolder = zip.folder(folderName);
  if (!rootFolder) return;

  for (const file of files) {
    rootFolder.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `${folderName}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

export function copySingleFile(content: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(content).then(() => true).catch(() => false);
  }
  // Fallback for older browsers
  const textarea = document.createElement('textarea');
  textarea.value = content;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const successful = document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve(successful);
}
