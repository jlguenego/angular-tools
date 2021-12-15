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
  private pageTitle = '';
  private defaultTitle = 'Please set a default title';

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof RoutesRecognized) {
        const data = getData(event);
        this.pageTitle = '';
        if (data) {
          this.pageTitle = data['title'];
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
    const title = this.pageTitle
      ? this.defaultTitle + ': ' + this.pageTitle
      : this.defaultTitle;
    window.document.title = title;
  }
}
