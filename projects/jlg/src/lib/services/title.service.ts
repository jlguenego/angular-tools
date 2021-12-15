import { Injectable } from '@angular/core';
import { Data, Router, RoutesRecognized } from '@angular/router';

const getData = (event: RoutesRecognized): Data | null => {
  const dataStack = [];
  let child = event.state.root.firstChild;
  if (!child) {
    return null;
  }
  while (child) {
    dataStack.push(child.data);
    if (!child.firstChild) {
      break;
    }
    child = child.firstChild;
  }
  while (dataStack.length > 0) {
    const data = dataStack.pop();
    if (data) {
      return data;
    }
  }
  return null;
};

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private currentStr = '';
  private defaultTitle = 'Please set a default title';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof RoutesRecognized) {
        const data = getData(event);
        this.currentStr = '';
        if (data) {
          this.currentStr = data['title'];
        }
        this.setDocumentTitle();
      }
    });
  }

  setDefaultTitle(defaultTitle: string) {
    this.defaultTitle = defaultTitle;
    this.setDocumentTitle();
  }

  setDocumentTitle() {
    const title = this.currentStr
      ? this.defaultTitle + ': ' + this.currentStr
      : this.defaultTitle;
    window.document.title = title;
  }
}
