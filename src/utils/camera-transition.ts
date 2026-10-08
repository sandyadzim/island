interface CameraRect { readonly left: number; readonly top: number; readonly width: number; }

/** Fit between the actual header and dock, including wrapped/enlarged controls. */
export function exploreCameraPose(viewportWidth: number, headerBottom: number, dockTop: number): { width: number; centerY: number } {
  const room = Math.max(0, dockTop - headerBottom);
  const gap = Math.min(24, Math.max(0, (room - 176) / 2));
  return { width: Math.min(viewportWidth, Math.max(0, room - gap * 2) * 1536 / 1056, 1250), centerY: headerBottom + room / 2 };
}

/** FLIP the whole registered frame. Both poses retain its original aspect ratio. */
export function cameraFromTransform(from: CameraRect, to: CameraRect, offset: { x: number; y: number }): string {
  if (to.width <= 0) return `matrix(1, 0, 0, 1, ${offset.x}, ${offset.y})`;
  const scale = from.width / to.width;
  return `matrix(${scale}, 0, 0, ${scale}, ${from.left - to.left + offset.x}, ${from.top - to.top + offset.y})`;
}
