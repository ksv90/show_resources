import { SpineParser } from '@pixi-spine/loader-4.1';
import { Spine } from '@pixi-spine/runtime-4.1';
import * as PIXI from 'pixi.js';

import { spineAnimations } from './store';

SpineParser.registerLoaderPlugin();

export async function loadData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const data = (await response.json()) as T;
  if (!data) throw new Error(`'${url}' not loaded`);
  return data;
}

const urlConverter = (url: string): [string, string] => [url, url];

const loaderFactoryBuilder =
  (loader: PIXI.Loader) =>
  (callback?: (resource: PIXI.LoaderResource) => void) =>
  ([name, url]: [string, string]) => {
    const resource = loader.resources[name];
    if (!resource) loader.add(name, url, callback);
  };

export async function loadAssets(
  configURL: string,
  progressCallback?: (progress: number) => void,
): Promise<void> {
  const loader = PIXI.Loader.shared;
  const loaderFactory = loaderFactoryBuilder(loader);

  const config = await loadData<string[]>(configURL);

  if (!config) throw new Error(`${configURL} not loaded`);

  config.map(urlConverter).forEach(
    loaderFactory((resource) => {
      const { spineData } = resource;
      if (!spineData) {
        throw new Error(`Spine animation ${resource.url} not loaded`);
      }
      spineData.animations.forEach((animation) => {
        spineAnimations.set(animation.name, spineData);
      });
    }),
  );

  const updateProgress = (progress: number) => {
    if (progressCallback) {
      progressCallback(Math.floor(progress));
    }
  };

  await new Promise<void>((resolve) => {
    const progressSignalBind = loader.onProgress.add(() => updateProgress(loader.progress));
    loader.load(() => {
      loader.onProgress.detach(progressSignalBind);
      updateProgress(100);
      resolve();
    });
  });
}

export const createAnimations = (name: string): Spine => {
  const skeleton = spineAnimations.get(name);

  if (!skeleton) throw new Error(`${name} not name`);
  return new Spine(skeleton);
};

export const installer = async (app: PIXI.Application): Promise<void> => {
  await loadAssets('config.json');

  // const ANIM = 'popup_start_idle';
  const ANIM = 'ending';

  const { width, height } = app.view;

  const spine = createAnimations(ANIM);
  spine.position.set(width / 2, height / 2);
  spine.state.setAnimation(0, ANIM, true);

  app.stage.addChild(spine);
};
