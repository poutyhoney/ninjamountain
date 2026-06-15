// Decorative dot-and-line constellation — the brand's "connect the dots" motif.
// Pure SVG, no interactivity, safe in Server Components.

type Node = { x: number; y: number; r: number; accent?: boolean };

const NODES: Node[] = [
  { x: 70,  y: 60,  r: 3 },
  { x: 170, y: 40,  r: 2.5 },
  { x: 250, y: 95,  r: 4, accent: true },
  { x: 130, y: 130, r: 5, accent: true },
  { x: 320, y: 150, r: 2.5 },
  { x: 60,  y: 180, r: 3 },
  { x: 200, y: 200, r: 6, accent: true },
  { x: 300, y: 230, r: 3 },
  { x: 110, y: 240, r: 2.5 },
  { x: 250, y: 280, r: 4, accent: true },
  { x: 360, y: 90,  r: 2 },
  { x: 40,  y: 110, r: 2 },
];

// Index pairs to connect with lines.
const EDGES: [number, number][] = [
  [0, 3], [1, 2], [3, 6], [2, 4], [5, 8], [6, 7], [6, 9], [8, 9], [3, 1], [4, 10], [0, 11],
];

export default function DotConstellation({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      className={className}
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke="#8B6CFF" strokeWidth="1" opacity="0.25">
        {EDGES.map(([a, b], i) => (
          <line key={i} x1={NODES[a].x} y1={NODES[a].y} x2={NODES[b].x} y2={NODES[b].y} />
        ))}
      </g>
      {NODES.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={n.accent ? '#8B6CFF' : '#C8CCD4'}
          opacity={n.accent ? 0.9 : 0.45}
        />
      ))}
    </svg>
  );
}
