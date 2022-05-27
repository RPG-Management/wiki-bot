export interface Spells {
  count: number;
  results: SpellListing[];
}

export interface SpellListing {
  index: string;
  name: string;
  url: string;
}
