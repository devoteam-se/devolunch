import path from 'path';
import sharp from 'sharp';

import { BUCKET_NAME, storage } from './index.js';

export const resizeImage = async (dir: string, filename: string) => {
  const restaurant = await import(path.join(dir, filename));

  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(`images/${restaurant.meta.title}.webp`);
  const existsArray = await file.exists();
  const exists = existsArray[0];

  if (!exists) {
    const remoteWriteStream = bucket
      .file(`images/${restaurant.meta.title.toLowerCase().replace(/[^a-z]+/, '')}.webp`)
      .createWriteStream();

    const res = await fetch(restaurant.meta.imgUrl);
    const buffer = await res.arrayBuffer();
    sharp(buffer)
      .resize(400, 300, {
        fit: 'cover',
      })
      .withMetadata()
      .webp({
        quality: 70,
      })
      .pipe(remoteWriteStream);
  }
};
