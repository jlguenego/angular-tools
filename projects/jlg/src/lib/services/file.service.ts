import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: HttpClient) {}

  add(image: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', image);
    return this.http.post<{ url: string }>('/api/upload', formData);
  }

  getUrl(name: string): string {
    return '/api/upload/' + name;
  }
}
