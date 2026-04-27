export const DEFAULT_REGION_CITY = process.env.NEXT_PUBLIC_DEFAULT_CITY || "Patiala";
export const DEFAULT_REGION_STATE = process.env.NEXT_PUBLIC_DEFAULT_STATE || "Punjab";

export function formatRegionLabel() {
  return `${DEFAULT_REGION_STATE}, ${DEFAULT_REGION_CITY}`;
}
