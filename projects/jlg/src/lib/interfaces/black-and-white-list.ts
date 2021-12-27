export interface BlackAndWhiteList {
  blackList?: Specifier[];
  whiteList?: Specifier[];
}

export interface SpecifierObject {
  type: 'regexp' | 'string';
  path: string;
}

export type Specifier = SpecifierObject | string;
