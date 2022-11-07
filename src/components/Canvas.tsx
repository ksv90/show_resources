import * as PIXI from 'pixi.js';
import { useCallback, useEffect, useRef } from 'react';

export type CanvasProps = {
  width: number;
  height: number;
  onMount: (app: PIXI.Application) => Promise<void>;
};

// TODO: не используется
function Canvas({ width = 1920, height = 1080, onMount }: CanvasProps) {
  const mount = useCallback(onMount, [onMount]);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) {
      const app = new PIXI.Application({ width, height, view: ref.current });
      mount(app).catch((err: string) => {
        throw new Error(err);
      });
      return () => app.destroy();
    }
    return () => {};
  }, [width, height, mount]);

  return <canvas ref={ref} />;
}

export default Canvas;
