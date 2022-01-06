import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';
import { lastValueFrom } from 'rxjs';

export interface FileServiceOptions {
  compress?: {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    maxIteration?: number;
    exifOrientation?: number;
    onProgress?: (progress: number) => void;
    fileType?: string;
    initialQuality?: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  async add(image: File, options: FileServiceOptions = {}): Promise<void> {
    let compressedImage = image;
    if (options.compress) {
      // compress before sending
      console.log('about to compress');
      try {
        const file = await imageCompression(image, options.compress);
        compressedImage = new File([file], image.name, {
          type: image.type,
          lastModified: image.lastModified,
        });
        console.log('compressedImage: ', compressedImage);
      } catch (err) {
        console.log('err: ', err);
        throw err;
      }
    }
    const formData = new FormData();
    formData.append('file', compressedImage);
    await lastValueFrom(this.http.post<void>('/api/upload', formData));
  }

  getUrl(name: string): string {
    return '/api/upload/' + name;
  }
}
