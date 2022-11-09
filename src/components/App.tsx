import { Spine } from '@pixi-spine/runtime-4.1';
import { Application } from 'pixi.js';
import { ChangeEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';

import { loadAnimations } from '../utils';
import Button from './Button';
import SelectFile from './SelectFile';

export default function App() {
  const ref = useRef<HTMLDivElement>(null);
  const app = useMemo(() => new Application({ width: 1080, height: 720 }), []);
  const [spineList, setSpineList] = useState<Spine[]>([]);
  const [actualSpine, setActualSpine] = useState<Spine | null>(null);

  useEffect(
    () => () => {
      app.view.remove();
      app.destroy();
      setSpineList([]); // TODO: чистить загрузчики
    },
    [app],
  );

  useEffect(() => {
    ref.current?.appendChild(app.view);
  }, [app, ref]);

  const loadFileHandler = ({ target }: ChangeEvent<HTMLInputElement>): void => {
    loadAnimations(target.files)
      .then((spines) => {
        spines.forEach((spine) => {
          setSpineList((prevState) => [...prevState, spine]);
        });
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.error('error');
      });
  };

  const spineListClickHandler = ({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
    const spine = spineList.find(({ name }) => name === currentTarget.name);
    setActualSpine(spine ?? null);
  };

  const animationClickHandler = ({ currentTarget }: MouseEvent<HTMLButtonElement>) => {
    if (!actualSpine) return;
    const { width, height } = app.view;
    actualSpine.position.set(width / 2, height / 2);
    actualSpine.state.setAnimation(0, currentTarget.name, true);
    app.stage.addChild(actualSpine);
  };

  return (
    <>
      <div ref={ref} />
      <SelectFile onChange={loadFileHandler} />
      <div>
        {spineList.map(({ name }) => (
          <Button key={name} name={name} onClick={spineListClickHandler} />
        ))}
      </div>
      <div>
        {actualSpine?.skeleton.data.animations?.map(({ name }) => (
          <Button key={name} name={name} onClick={animationClickHandler} />
        ))}
      </div>
    </>
  );
}
