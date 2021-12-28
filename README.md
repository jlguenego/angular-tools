<div align="center" style="text-align: center; color: green; font-weight: bold">
  <h1>@jlguenego/angular-tools</h1>
  <img src="docs/logo.svg" height="50px">
  <p>Simple and useful tools for angular apps.</p>
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
  - [Timeout](#timeout)
- [Services](#services)
  - [AngularToolsConfigService](#angulartoolsconfigservice)
  - [ColorSchemeService](#colorschemeservice)
  - [CrudService](#crudservice)
  - [NetworkService](#networkservice)
  - [TitleService](#titleservice)
- [Module Connect](#module-connect)
  - [interfaces](#interfaces)
    - [User](#user)
  - [Services](#services-1)
    - [Authentication](#authentication)
    - [Authorization](#authorization)
    - [OAuth2](#oauth2)
- [Module OfflineStorage](#module-offlinestorage)
  - [Interceptors](#interceptors-1)
    - [NetworkInterceptor](#networkinterceptor)
  - [Services](#services-2)
    - [CacheService](#cacheservice)
    - [NetworkService](#networkservice-1)
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

## Timeout

The TimeoutInterceptor adds a timeout on every HTTP request made with the HttpClient service.

```ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TimeoutInterceptor,
    multi: true,
  }
],
```

# Services

## AngularToolsConfigService

This service is only for configuring all the other tools of this library.

To change the configuration, you should subclass this service, and change only the parameters you need.

In the `app.module.ts` file:

```ts
providers: [
  // ...
  {
    provide: AngularToolsConfigService,
    useClass: CustomAngularToolsConfigService,
  },
],
```

You create a service called `CustomAngularToolsConfigService` like this:

```ts
import { Injectable } from "@angular/core";
import { AngularToolsConfigService } from "@jlguenego/angular-tools";

@Injectable({
  providedIn: "root",
})
export class CustomAngularToolsConfigService extends AngularToolsConfigService {
  override timeoutMsg = `Le serveur n'a pas répondu dans le délai imparti de ${this.timeoutDelay}ms.`;
}
```

You can see all the configuration parameters inside the `AngularToolsConfigService` class.

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

# Module Connect

This module gives all user management tools.

## interfaces

### User

```ts
export interface User {
  id: string;
  displayName: string;
  email: string;
  identityProvider: string;
}
```

## Services

### Authentication

The authentication service gives an behavior subject `user$` that returns `undefined` when no user is connected, and a user object when someone is connected.

The service has the following methods:

- `isConnected()`: It gives a way to test if someone is connected to the back-end by calling an API.
- `disconnect()`: disconnect a user
- `setAfterLoginRoute()`: Specify the route url to go after being logged.

As you can see, you cannot connect through the authentication service. You need the `Oauth2Service` to connect.

### Authorization

The authorization service gives access to the authorization config for a given connected user.

- `getAuthConfig()`: get the user authorization config from the back-end.
- `canGoToPath(path: string): Observable<boolean>`: indicates if the connected user can go the specified route path.
- `can(privilege: string): Observable<boolean>`: indicates if the connected user has the given _privilege_.

A **privilege** is just a string, that the developer can configure on the
back-end side, in the authorization config object in order to specify what the
user can do or cannot do with the front-end. The developer can disable/enable
button, hide/show text, etc. according a privilege.

### OAuth2

The OAuth2 service allows to connect a user with the OAUTH2 protocol and a given
identity provider (like Github, Google, Facebook, Twitter, Microsoft Azure AD,
etc.)

It just gives what the front-end needs: the url config for the "Connect with ..." button/link.
The rest is done by the back-end. The method is the following:

- `getAuthorizeUrl(provider: string): string`: for a given provider (GITHUB, etc.), return the url that the connect button needs.
- `config$` is a BehaviorSubject that show the full configuration for all
  providers. If you need the provider list, look at this object.

# Module OfflineStorage

This module allows the Angular application to run HTTP request in offline mode.
The offline mode is detected via the NetworkInterceptor.

In the `app.module.ts` declare the module with the forRoot method:

```ts
 imports: [
    BrowserModule,
    AppRoutingModule,
    // ...
    OfflineStorageModule.forRoot({ /* config */ }),
  ],
```

## Interceptors

### NetworkInterceptor

The `NetworkInterceptor` is already added to the interceptors when the module is declared.

## Services

### CacheService

Part of the OfflineStorage module.

The CacheService gives some primitives that allows a persistant cache to be used to manage _progressive web request_.
In this library we call **Progressive web request** an HTTP request that has the following properties:

- GET method:
  - online: the request is done with the back-end, then the response is stored in the front-end cache.
  - offline: the response is extracted from the front-end cache.
- POST/PUT/PATCH/DELETE methods:
  - online: the request is done on the back-end, and normally the user does not need the response.
  - offline: the request cannot be done on the back-end, so the request is stored in the front-end cache. The stored request is called an _offline order_. The offline order will be executed as soons as the front-end will be able to reach the back-end (online mode). The request is also functionnaly executed, but with the front-end cache.

The cache service gives the way to load image that are stored in the cache into an image HTML element `<img>`. The method is `cacheService.loadImage(img: HTMLImageElement, url: string)`.

### NetworkService

The network service exposes an observable that reflects the network status (online, or offline) in real time.

# Authors

Jean-Louis GUENEGO <jlguenego@gmail.com>
