import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  maxIteration?: number;
  exifOrientation?: number;
  onProgress?: (progress: number) => void;
  fileType?: string;
  initialQuality?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  async compress(image: File, options: CompressOptions = {}) {
    console.log('about to compress');
    const imageCompression = await import('browser-image-compression').then(
      (m) => m.default
    );
    try {
      const compressedFile = await imageCompression(image, options);
      // keep the original file name
      const compressedFileWithOriginalName = new File(
        [compressedFile],
        image.name,
        {
          type: image.type,
          lastModified: image.lastModified,
        }
      );
      console.log('compressedImage: ', compressedFileWithOriginalName);
      return compressedFileWithOriginalName;
    } catch (err) {
      console.log('err: ', err);
      throw err;
    }
  }

  async add(image: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', image);
    await lastValueFrom(this.http.post<void>('/api/upload', formData));
  }

  getUrl(name: string): string {
    return '/api/upload/' + name;
  }
}
