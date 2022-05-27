export interface AbilityScoreList {
  index: string;
  name: string;
  url: string;
}

export interface AbilityScore {
  index: string;
  name: string;
  full_name: string;
  desc: string[];
  skills: Skill[];
  url: string;
}

export interface Skill {
  name: string;
  index: string;
  url: string;
}
