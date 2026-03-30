const adjectives = [
  "Silent",
  "Swift",
  "Phantom",
  "Shadow",
  "Covert",
  "Slick",
  "Nimble",
  "Daring",
  "Rogue",
  "Elusive",
  "Cunning",
  "Crafty",
  "Stealth",
  "Bold",
  "Clever",
];

const nouns = [
  "Fox",
  "Ghost",
  "Viper",
  "Wolf",
  "Raven",
  "Cobra",
  "Panther",
  "Lynx",
  "Jackal",
  "Hawk",
  "Falcon",
  "Cipher",
  "Specter",
  "Dagger",
  "Wraith",
];

const verbs = [
  "Strikes",
  "Vanishes",
  "Deceives",
  "Infiltrates",
  "Evades",
  "Prowls",
  "Shadows",
  "Outsmarts",
  "Slips",
  "Ambushes",
  "Outwits",
  "Escapes",
  "Lurks",
  "Maneuvers",
  "Disappears",
];

function pick(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

export function generateCodename(): string {
  return pick(adjectives) + pick(nouns) + pick(verbs);
}
