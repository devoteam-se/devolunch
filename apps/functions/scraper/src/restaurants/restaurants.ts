import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { RestaurantMetaProps } from '@devolunch/shared';

const RESTAURANTS_DIR = path.dirname(fileURLToPath(import.meta.url));

const isRuntimeJs = (file: string) => file.toLowerCase().endsWith('.js');

const shouldSkip = (file: string) => {
  const name = file.toLowerCase();
  return (
    name === 'ai-generic.js' || name.endsWith('.test.js') || name === 'restaurants.js' // this file
  );
};

export const getMetasFromRestaurantFiles = async (): Promise<RestaurantMetaProps[]> => {
  const files = await fs.readdir(RESTAURANTS_DIR);
  const metas: RestaurantMetaProps[] = [];
  const seenByUrl = new Set<string>();

  for (const file of files) {
    if (!isRuntimeJs(file) || shouldSkip(file)) continue;
    const modPath = path.join(RESTAURANTS_DIR, file);
    try {
      const mod: any = await import(modPath);
      const meta = mod.meta as RestaurantMetaProps | undefined;
      if (meta && meta.url && !seenByUrl.has(meta.url)) {
        metas.push(meta);
        seenByUrl.add(meta.url);
      }
    } catch (e) {
      // ignore broken modules; continue collecting
      console.warn(`⚠️  Skipping ${file}: ${e}`);
    }
  }
  return metas;
};
