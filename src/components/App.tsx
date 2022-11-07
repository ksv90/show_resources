import { Application } from 'pixi.js';
import { useEffect, useMemo, useRef } from 'react';

import { installer } from '../utils';

export default function App() {
  const ref = useRef<HTMLDivElement>(null);
  const app = useMemo(() => new Application({ width: 1920, height: 1080 }), []);

  useEffect(() => {
    installer(app).catch(() => undefined);
    return () => {
      app.view.remove();
      app.destroy();
    };
  }, [app]);

  useEffect(() => {
    ref.current?.appendChild(app.view);
  }, [app, ref]);

  return (
    <>
      <div ref={ref} />
      {/* <SelectFile onChange={changeFileHandler} /> */}
    </>
  );
}
