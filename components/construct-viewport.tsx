"use client";

import { useEffect, useRef, useState } from "react";

import { buildConstructGeometry } from "../lib/constructs/geometry";
import type { ConstructKind } from "../lib/lanterns/types";

type Mat4 = Float32Array;

function identity(): Mat4 {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);

  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;

      for (let index = 0; index < 4; index += 1) {
        sum += a[index * 4 + row] * b[column * 4 + index];
      }

      out[column * 4 + row] = sum;
    }
  }

  return out;
}

function perspective(
  fieldOfViewRadians: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  const f = 1 / Math.tan(fieldOfViewRadians / 2);
  const rangeInverse = 1 / (near - far);
  const out = new Float32Array(16);

  out[0] = f / aspect;
  out[5] = f;
  out[10] = (near + far) * rangeInverse;
  out[11] = -1;
  out[14] = near * far * rangeInverse * 2;

  return out;
}

function translation(x: number, y: number, z: number): Mat4 {
  const out = identity();
  out[12] = x;
  out[13] = y;
  out[14] = z;
  return out;
}

function rotationX(angle: number): Mat4 {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return new Float32Array([
    1, 0, 0, 0,
    0, cosine, sine, 0,
    0, -sine, cosine, 0,
    0, 0, 0, 1,
  ]);
}

function rotationY(angle: number): Mat4 {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return new Float32Array([
    cosine, 0, -sine, 0,
    0, 1, 0, 0,
    sine, 0, cosine, 0,
    0, 0, 0, 1,
  ]);
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = createShader(
    gl,
    gl.VERTEX_SHADER,
    `
      attribute vec3 a_position;
      uniform mat4 u_matrix;

      void main() {
        gl_Position = u_matrix * vec4(a_position, 1.0);
      }
    `,
  );

  const fragment = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    `
      precision mediump float;

      void main() {
        gl_FragColor = vec4(0.384, 1.0, 0.624, 0.88);
      }
    `,
  );

  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }

  const program = gl.createProgram();

  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function pointerDistance(
  points: Map<number, { x: number; y: number }>,
) {
  const values = [...points.values()];
  if (values.length < 2) return null;

  return Math.hypot(
    values[0].x - values[1].x,
    values[0].y - values[1].y,
  );
}

export function ConstructViewport({
  kind,
  buildPulse,
  label,
}: {
  kind: ConstructKind;
  buildPulse: number;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      depth: true,
      premultipliedAlpha: false,
    });

    if (!gl) {
      canvas.dataset.renderer = "fallback";
      setUnavailable(true);
      return;
    }

    const program = createProgram(gl);

    if (!program) {
      canvas.dataset.renderer = "fallback";
      setUnavailable(true);
      return;
    }

    canvas.dataset.renderer = "webgl";
    setUnavailable(false);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");
    const buffer = gl.createBuffer();
    const geometry = buildConstructGeometry(kind);

    if (!buffer || positionLocation < 0 || !matrixLocation) {
      if (buffer) gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      canvas.dataset.renderer = "fallback";
      setUnavailable(true);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    let yaw = -0.45;
    let pitch = kind === "bridge" ? 0.48 : 0.22;
    let distance = kind === "bridge" ? 5.2 : 4.4;
    const pointers = new Map<number, { x: number; y: number }>();
    let lastPinchDistance: number | null = null;
    let frameId = 0;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const buildStart = performance.now();
    const buildDuration = reducedMotion ? 0 : 1050;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const render = (now: number) => {
      resize();

      const width = canvas.width;
      const height = canvas.height;
      const aspect = width / Math.max(1, height);
      const projection = perspective(Math.PI / 3.15, aspect, 0.1, 100);
      const view = translation(0, 0, -distance);
      const rotate = multiply(rotationY(yaw), rotationX(pitch));
      const matrix = multiply(projection, multiply(view, rotate));

      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      const elapsed = Math.max(0, now - buildStart);
      const rawProgress =
        buildDuration === 0 ? 1 : clamp(elapsed / buildDuration, 0, 1);
      const progress = 1 - Math.pow(1 - rawProgress, 3);
      const visibleSegments = Math.max(
        1,
        Math.ceil(geometry.segmentCount * progress),
      );

      gl.drawArrays(gl.LINES, 0, visibleSegments * 2);
      frameId = window.requestAnimationFrame(render);
    };

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      lastPinchDistance = pointerDistance(pointers);
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 1) {
        yaw += (event.clientX - previous.x) * 0.009;
        pitch = clamp(
          pitch + (event.clientY - previous.y) * 0.009,
          -1.15,
          1.15,
        );
        return;
      }

      const nextDistance = pointerDistance(pointers);

      if (nextDistance !== null && lastPinchDistance !== null) {
        distance = clamp(
          distance + (lastPinchDistance - nextDistance) * 0.012,
          2.8,
          8,
        );
      }

      lastPinchDistance = nextDistance;
    };

    const releasePointer = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      lastPinchDistance = pointerDistance(pointers);

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      distance = clamp(distance + event.deltaY * 0.004, 2.8, 8);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") yaw -= 0.12;
      else if (event.key === "ArrowRight") yaw += 0.12;
      else if (event.key === "ArrowUp") pitch = clamp(pitch - 0.12, -1.15, 1.15);
      else if (event.key === "ArrowDown") pitch = clamp(pitch + 0.12, -1.15, 1.15);
      else if (event.key === "+" || event.key === "=") distance = clamp(distance - 0.3, 2.8, 8);
      else if (event.key === "-") distance = clamp(distance + 0.3, 2.8, 8);
      else return;

      event.preventDefault();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", releasePointer);
    canvas.addEventListener("pointercancel", releasePointer);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("keydown", onKeyDown);
    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", releasePointer);
      canvas.removeEventListener("pointercancel", releasePointer);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("keydown", onKeyDown);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [buildPulse, kind]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="construct-viewport">
      <canvas
        ref={canvasRef}
        className="construct-viewport__canvas"
        tabIndex={0}
        role="application"
        aria-roledescription="3D construct viewport"
        aria-label={`Interactive three-dimensional ${label}. Drag to orbit. Pinch or scroll to zoom. Arrow keys rotate; plus and minus zoom.`}
      />
      <div className="construct-viewport__instructions" aria-hidden="true">
        DRAG // ORBIT&nbsp;&nbsp;&nbsp; PINCH / WHEEL // RANGE
      </div>
      {unavailable ? (
        <div className="construct-viewport__fallback" role="status">
          <b>3D RENDERER UNAVAILABLE</b>
          <span>
            Structural training data remains available in the controls.
          </span>
        </div>
      ) : null}
    </div>
  );
}
