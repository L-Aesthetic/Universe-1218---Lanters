import type { ConstructKind } from "../lanterns/types";

export type Vec3 = [number, number, number];

export type ConstructGeometry = {
  vertices: Float32Array;
  segmentCount: number;
};

function pushSegment(target: number[], a: Vec3, b: Vec3) {
  target.push(...a, ...b);
}

function pushCircle(
  target: number[],
  radius: number,
  z: number,
  segments = 48,
) {
  for (let index = 0; index < segments; index += 1) {
    const a = (index / segments) * Math.PI * 2;
    const b = ((index + 1) / segments) * Math.PI * 2;

    pushSegment(
      target,
      [Math.cos(a) * radius, Math.sin(a) * radius, z],
      [Math.cos(b) * radius, Math.sin(b) * radius, z],
    );
  }
}

function shieldGeometry() {
  const vertices: number[] = [];

  pushCircle(vertices, 1.45, 0, 64);
  pushCircle(vertices, 1.08, 0.08, 48);
  pushCircle(vertices, 0.68, 0.15, 40);

  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    const inner: Vec3 = [
      Math.cos(angle) * 0.68,
      Math.sin(angle) * 0.68,
      0.15,
    ];
    const outer: Vec3 = [
      Math.cos(angle) * 1.45,
      Math.sin(angle) * 1.45,
      0,
    ];

    pushSegment(vertices, inner, outer);
  }

  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2;
    pushSegment(
      vertices,
      [
        Math.cos(angle) * 1.45,
        Math.sin(angle) * 1.45,
        0,
      ],
      [
        Math.cos(angle) * 1.2,
        Math.sin(angle) * 1.2,
        -0.25,
      ],
    );
  }

  pushCircle(vertices, 1.2, -0.25, 48);

  return vertices;
}

function bridgeGeometry() {
  const vertices: number[] = [];
  const deckY = -0.45;
  const deckZ = 0;
  const halfLength = 1.75;
  const halfWidth = 0.48;

  for (const z of [-halfWidth, halfWidth]) {
    pushSegment(
      vertices,
      [-halfLength, deckY, z],
      [halfLength, deckY, z],
    );
  }

  for (let x = -1.5; x <= 1.5; x += 0.5) {
    pushSegment(
      vertices,
      [x, deckY, -halfWidth],
      [x, deckY, halfWidth],
    );
  }

  for (const x of [-1.25, 1.25]) {
    for (const z of [-halfWidth, halfWidth]) {
      pushSegment(vertices, [x, deckY, z], [x, 1.05, z]);
      pushSegment(
        vertices,
        [x, 1.05, z],
        [x, 1.05, z === -halfWidth ? halfWidth : -halfWidth],
      );
    }
  }

  for (const z of [-halfWidth, halfWidth]) {
    pushSegment(vertices, [-1.25, 1.05, z], [1.25, 1.05, z]);

    for (let x = -1.25; x < 1.25; x += 0.5) {
      pushSegment(
        vertices,
        [x, deckY, z],
        [x + 0.5, 1.05, z],
      );
      pushSegment(
        vertices,
        [x, 1.05, z],
        [x + 0.5, deckY, z],
      );
    }
  }

  pushSegment(
    vertices,
    [-halfLength, deckY, -halfWidth],
    [-1.25, 1.05, -halfWidth],
  );
  pushSegment(
    vertices,
    [-halfLength, deckY, halfWidth],
    [-1.25, 1.05, halfWidth],
  );
  pushSegment(
    vertices,
    [halfLength, deckY, -halfWidth],
    [1.25, 1.05, -halfWidth],
  );
  pushSegment(
    vertices,
    [halfLength, deckY, halfWidth],
    [1.25, 1.05, halfWidth],
  );

  return vertices;
}

function beaconGeometry() {
  const vertices: number[] = [];

  for (const radius of [0.42, 0.82, 1.22]) {
    pushCircle(vertices, radius, 0, 56);
  }

  for (let index = 0; index < 16; index += 1) {
    const angle = (index / 16) * Math.PI * 2;
    pushSegment(
      vertices,
      [0, 0, 0],
      [Math.cos(angle) * 1.22, Math.sin(angle) * 1.22, 0],
    );
  }

  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    pushSegment(
      vertices,
      [Math.cos(angle) * 0.72, 0, Math.sin(angle) * 0.72],
      [Math.cos(angle) * 1.08, 0, Math.sin(angle) * 1.08],
    );
  }

  pushSegment(vertices, [0, -1.35, 0], [0, 1.35, 0]);

  return vertices;
}

export function buildConstructGeometry(kind: ConstructKind): ConstructGeometry {
  const raw =
    kind === "shield"
      ? shieldGeometry()
      : kind === "bridge"
        ? bridgeGeometry()
        : beaconGeometry();

  return {
    vertices: new Float32Array(raw),
    segmentCount: raw.length / 6,
  };
}
