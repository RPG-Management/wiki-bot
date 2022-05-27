export interface Spells {
  count: number;
  results: SpellListing[];
}

export interface SpellListing {
  index: string;
  name: string;
  url: string;
}

export interface DamageType {
  index: string;
  name: string;
  url: string;
}

export interface Damage {
  damage_type: DamageType;
  damage_at_character_level?: { [key: string]: string };
  damage_at_slot_level?: { [key: string]: string };
}

export interface DcType {
  index: string;
  name: string;
  url: string;
}

export interface Dc {
  dc_type: DcType;
  dc_success: string;
}

export interface School {
  index: string;
  name: string;
  url: string;
}

export interface Class {
  index: string;
  name: string;
  url: string;
}

export interface Subclass {
  index: string;
  name: string;
  url: string;
}

export interface Spell {
  _id: string;
  higher_level: any[];
  index: string;
  name: string;
  desc: string[];
  range: string;
  components: string[];
  ritual: boolean;
  attack_type?: string;
  duration: string;
  concentration: boolean;
  casting_time: string;
  level: number;
  damage?: Damage;
  dc?: Dc;
  school?: School;
  classes: Class[];
  subclasses: Subclass[];
  url: string;
}
