import { TextureAtlas } from '@pixi-spine/base';
import { SpineParser } from '@pixi-spine/loader-4.1';
import { AtlasAttachmentLoader, SkeletonJson, Spine } from '@pixi-spine/runtime-4.1';
import { BaseTexture } from 'pixi.js';

SpineParser.registerLoaderPlugin();

export const splitFiles = (files: FileList): [File[], File[], File[]] => {
  const JSON_TYPE = 'application/json';
  const textureTypes = ['image/png', 'image/jpg'];
  return [...files].reduce<[File[], File[], File[]]>(
    ([json, atlas, img], file) => {
      if (textureTypes.includes(file.type)) return [json, atlas, [...img, file]];
      if (file.type === JSON_TYPE) return [[...json, file], atlas, img];
      return [json, [...atlas, file], img];
    },
    [[], [], []],
  );
};

export const loadFile = async (file: File): Promise<Response> => {
  const objectURL = URL.createObjectURL(file);
  try {
    return await fetch(objectURL);
  } catch {
    throw new Error(`The file ${file.name} is not uploaded`);
  } finally {
    URL.revokeObjectURL(objectURL);
  }
};

export const addTexture = async (file: File): Promise<BaseTexture> => {
  const objectURL = URL.createObjectURL(file);
  const textureLoader = BaseTexture.from(objectURL);
  try {
    return await new Promise<BaseTexture>((resolve, reject) => {
      textureLoader.addListener('loaded', () => resolve(textureLoader));
      textureLoader.addListener('error', (error: unknown) => reject(error));
    });
  } catch {
    throw new Error(`Texture ${file.name} not loader`);
  } finally {
    URL.revokeObjectURL(objectURL);
  }
};

export const createResponseMap = async (files: File[]): Promise<Map<string, Response>> => {
  const responses = await Promise.all(
    files.map(async (file): Promise<[string, Response]> => [file.name, await loadFile(file)]),
  );
  return new Map<string, Response>(responses);
};

export const createTextureMap = async (files: File[]): Promise<Map<string, BaseTexture>> => {
  const responses = await Promise.all(
    files.map(async (file): Promise<[string, BaseTexture]> => [file.name, await addTexture(file)]),
  );
  return new Map<string, BaseTexture>(responses);
};

export const getAtlas = async (fullname: string, map: Map<string, Response>): Promise<string> => {
  const [name] = fullname.split('.');
  const atlasName = `${name ?? ''}.atlas`;
  const atlasFileResponse = map.get(atlasName);
  if (!atlasFileResponse) throw new Error(`Atlas file ${atlasName} not found`);
  map.delete(atlasName);
  return atlasFileResponse.text();
};

export const getTextures = (path: string, map: Map<string, BaseTexture>): BaseTexture => {
  const texture = map.get(path);
  if (!texture) throw new Error(`Texture ${path} not found`);
  map.delete(path);
  return texture;
};

export const loadAnimations = async (files: FileList | null) => {
  if (!files) throw new Error('Files are not selected');
  const [jsonFiles, atlasFiles, textureFiles] = splitFiles(files);

  if (!jsonFiles.length) throw new Error('json file not found');
  if (!atlasFiles.length) throw new Error('atlas file not found');
  if (!textureFiles.length) throw new Error('image file not found');

  const [jsonMap, atlasMap, textureMap] = await Promise.all([
    createResponseMap(jsonFiles),
    createResponseMap(atlasFiles),
    createTextureMap(textureFiles),
  ]);

  return Promise.all(
    [...jsonMap.entries()].map(async ([fullname, response]) => {
      const [name = ''] = fullname.split('.');
      const atlas = await getAtlas(name, atlasMap);
      const json = (await response.json()) as unknown;

      const textureAtlas = new TextureAtlas(atlas, (path, loader) => {
        loader(getTextures(path, textureMap));
      });

      const atlasAttachmentLoader = new AtlasAttachmentLoader(textureAtlas);
      const skeletonJson = new SkeletonJson(atlasAttachmentLoader);
      const spineData = skeletonJson.readSkeletonData(json);

      const spine = new Spine(spineData);
      spine.name = name;
      return spine;
    }),
  );
};
