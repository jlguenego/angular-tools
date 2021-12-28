<div align="center" style="text-align: center; color: green; font-weight: bold">
  <h1>@jlguenego/angular-tools</h1>
  <img src="docs/logo.svg" height="50px">
  <p>Misc tools for angular apps.</p>
</div>

```
cd <angular-app>
npm i @jlguenego/angular-tools
```

- [JlgWidgetsModule](#jlgwidgetsmodule)
  - [directive autofocus](#directive-autofocus)
- [Validators](#validators)
  - [JlgValidators class](#jlgvalidators-class)
    - [integer](#integer)
  - [DuplicateAsyncValidator](#duplicateasyncvalidator)
- [Interceptors](#interceptors)
  - [Credentials](#credentials)
  - [Network](#network)
- [Services](#services)
  - [ColorSchemeService](#colorschemeservice)
  - [CrudService](#crudservice)
  - [NetworkService](#networkservice)
  - [TitleService](#titleservice)
- [Authors](#authors)

# JlgWidgetsModule

## directive autofocus

Like the HTML autofocus attribute, but refresh when the component starts.

Just set the focus,

```html
<input jlgAutofocus />
```

or set the focus and select all the input text.

```html
<input jlgAutofocus="select" />
```

# Validators

The Angular out of the box validators are great but we need more.

## JlgValidators class

### integer

This validator checks if the input is an integer.

```ts
new FormControl(1, [Validators.required, JlgValidators.integer]);
```

## DuplicateAsyncValidator

Do a http request to get a JSON array response. If the response is not empty then the field is invalid. The error object is:

```js
{
  duplicate: {
    value: control.value;
  }
}
```

Example:

```ts
new FormControl('', {
  validators: [
    Validators.required,
    Validators.maxLength(10),
    Validators.minLength(3),
  ],
  asyncValidators: [
    this.duplicateAsyncValidator.validate(
      (val: string) => '/api/articles?filter[name]=' + val
    ),
  ],
}),
```

# Interceptors

## Credentials

Set the `withCredentials: true` to all HTTP requests.

In `app.module.ts` set the providers as follows:

```ts
providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CredentialsInterceptor,
      multi: true,
    },
  ],
```

## Network

The NetworkService can work correctly only if the NetworkInterceptor is
installed. This interceptor detects if the browser can access to the
back-end server and set the NetworkService status$ observable accordingly.

The interceptor will set the network status to `online` or `offline` according the HTTP response.

```ts
providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkInterceptor,
      multi: true,
    },
  ],
```

# Services

## ColorSchemeService

This service tracks and controls the prefered color scheme in css, and the primary hue.

- The theme adds a `dark` or `light` class to the body HTML element that is synchronized with the css prefered color scheme.
- The theme adds in the local storage the user preferences about the `dark` or `light` wanted color scheme.
- The service exposes a method `toggleColorScheme` to toggle the color scheme.
- The service uses 2 favicons that must be located under `assets/favicon-dark.svg` and `assets/favicon-light.svg`.

```ts
// to change the theme from 'dark' to 'light' and vice versa.
toggleColorScheme();
```

## CrudService

Allow to Create, Retrieve, Update, Delete documents on a REST backend.

This service is designed to work well with the [crudity library](https://github.com/jlguenego/crudity).
It works with Observables.

First declare a service like this:

```ts
import { Injectable } from "@angular/core";
import { CrudService } from "@jlguenego/angular-tools";
import { Article } from "../interfaces/article";

@Injectable({
  providedIn: "root",
})
export class ArticleService extends CrudService<Article> {
  getEndpoint(): string {
    return "/api/articles";
  }
}
```

This service exposes the following:

- `documents$`: BehaviorSubject<Article[]> that reflect the list of documents
- `retrieveAll(): Observable<void>`
- `add(): Observable<void>`
- `remove(set: Set<T>): Observable<void>`

So components can call these at will.

## NetworkService

Give an observable reflecting the network status (`online`, `offline`).

## TitleService

This service set the `document.title` (title in the browser tab) to `<defaultTitle>: <pageTitle>`.
The pageTitle is set to the route definition under `data.title`.

Example:

`app-routing.module.ts`

```ts
{
  path: 'legal',
  component: LegalComponent,
  data: {
    title: 'Mentions Légales',
  },
},
```

`app.component.ts`

```ts
import { Component } from "@angular/core";
import { TitleService } from "@jlguenego/angular-tools";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  constructor(private titleService: TitleService) {
    this.titleService.setDefaultTitle("Gestion Stock");
  }
}
```

will set the `document.title` to `Gestion Stock: Mentions Légales` when the router navigates to `/legal`.

THe service take the data recursively through the children page. If the children has no data title then it tries to get the parent data title.

# Authors

Jean-Louis GUENEGO <jlguenego@gmail.com>
