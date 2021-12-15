<div align="center" style="text-align: center; color: green; font-weight: bold">
  <h1>@jlguenego/angular-tools</h1>
  <p>
    Misc tools for angular apps.
  </p>
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
  - [DuplicateAsyncValidatorService](#duplicateasyncvalidatorservice)
- [Interceptors](#interceptors)
  - [Credentials](#credentials)
- [Services](#services)
  - [ColorSchemeService](#colorschemeservice)
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

## DuplicateAsyncValidatorService

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
        this.duplicateAsyncValidatorService.validate(
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

# Services

## ColorSchemeService

This service tracks and control the prefered color scheme in css.

- The theme adds a `dark` or `light` class to the body HTML element that is synchronized with the css prefered color scheme.
- The theme adds in the local storage the user preferences about the `dark` or `light` wanted color scheme.
- The service exposes a method `toggleColorScheme` to toggle the color scheme.

```ts
// to change the theme from 'dark' to 'light' and vice versa.
toggleColorScheme();
```

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

# Authors

Jean-Louis GUENEGO <jlguenego@gmail.com>
