const CEREAL = [
  { phase: "sowing", weeksFromSow: 0 },
  { phase: "fertilizer", weeksFromSow: 4 },
  { phase: "irrigation", weeksFromSow: 8 },
  { phase: "harvest", weeksFromSow: 18 },
];

const RICE = [
  { phase: "sowing", weeksFromSow: 0 },
  { phase: "fertilizer", weeksFromSow: 3 },
  { phase: "irrigation", weeksFromSow: 2 },
  { phase: "harvest", weeksFromSow: 20 },
];

const COTTON = [
  { phase: "sowing", weeksFromSow: 0 },
  { phase: "fertilizer", weeksFromSow: 5 },
  { phase: "irrigation", weeksFromSow: 6 },
  { phase: "harvest", weeksFromSow: 22 },
];

const ROOT = [
  { phase: "sowing", weeksFromSow: 0 },
  { phase: "fertilizer", weeksFromSow: 5 },
  { phase: "irrigation", weeksFromSow: 4 },
  { phase: "harvest", weeksFromSow: 14 },
];

const PULSE = [
  { phase: "sowing", weeksFromSow: 0 },
  { phase: "fertilizer", weeksFromSow: 4 },
  { phase: "irrigation", weeksFromSow: 6 },
  { phase: "harvest", weeksFromSow: 12 },
];

const DEFAULT = [
  { phase: "sowing", weeksFromSow: 0 },
  { phase: "fertilizer", weeksFromSow: 4 },
  { phase: "irrigation", weeksFromSow: 6 },
  { phase: "harvest", weeksFromSow: 14 },
];

const MAP = {
  wheat: CEREAL,
  rice: RICE,
  maize: CEREAL,
  bajra: CEREAL,
  jowar: CEREAL,
  cotton: COTTON,
  potato: ROOT,
  onion: ROOT,
  tomato: ROOT,
  turmeric: ROOT,
  chilli: ROOT,
  garlic: ROOT,
  chana: PULSE,
  moong: PULSE,
  urad: PULSE,
  mustard: PULSE,
  soybean: PULSE,
  groundnut: PULSE,
  sunflower: PULSE,
  sugarcane: [
    { phase: "sowing", weeksFromSow: 0 },
    { phase: "fertilizer", weeksFromSow: 8 },
    { phase: "irrigation", weeksFromSow: 4 },
    { phase: "harvest", weeksFromSow: 52 },
  ],
};

export function getCropTimelineSteps(cropName) {
  const key = String(cropName || "").toLowerCase().trim();
  return MAP[key] ? [...MAP[key]] : [...DEFAULT];
}
