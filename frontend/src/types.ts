export type FashionCategory = "shirt" | "pants" | "hat" | "dress" | "jacket";

export interface HealthInfo {
  status: string;
  device: string;
  mode: string;
  streaming: boolean;
  models_loaded: boolean;
  resolution: number;
}

export interface StreamMessage {
  type: "frame" | "done" | "progress" | "error" | "cancelled" | "pong";
  image?: string;
  step?: number;
  message?: string;
}

export const CATEGORY_OPTIONS: { id: FashionCategory; label: string }[] = [
  { id: "shirt", label: "Áo" },
  { id: "pants", label: "Quần" },
  { id: "hat", label: "Nón" },
  { id: "dress", label: "Váy" },
  { id: "jacket", label: "Áo khoác" },
];
