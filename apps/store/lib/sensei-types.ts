export type Challenge = {
  id: string;
  ground: string;
  title: string;
  prompt: string;
};

export type SenseiLine =
  | { type: "text"; text: string }
  | { type: "done"; remaining: number }
  | { type: "error"; message: string };
