declare module 'randexp' {
  class RandExp {
    constructor(regexp: string | RegExp, flags?: string);
    gen(): string;
    randInt?: (from: number, to: number) => number;
  }
  export = RandExp;
}
