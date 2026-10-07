import { STAGE, type Point, type Registration } from '../components/island/scene-config.ts';

export function registerPoint(point: Point, registration: Registration): Point {
  return {
    x: registration.x + registration.scale * point.x,
    y: registration.y + registration.scale * point.y,
  };
}

export function sceneScale(availableWidth: number): number {
  return Math.min(1, Math.max(0, availableWidth) / STAGE.width);
}

/** Percentages keep registration identical in the CSS-only proportional stage. */
export function registrationStyle(registration: Registration, pivot: Point): string {
  const percent = (value: number, extent: number) => `${Number((value / extent * 100).toFixed(10))}%`;
  return [
    `--registration-x:${percent(registration.x, STAGE.width)}`,
    `--registration-y:${percent(registration.y, STAGE.height)}`,
    `--registration-scale:${registration.scale}`,
    `--pivot-x:${percent(pivot.x, STAGE.width)}`,
    `--pivot-y:${percent(pivot.y, STAGE.height)}`,
  ].join(';');
}
