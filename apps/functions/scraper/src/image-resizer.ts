import path from 'path';
import sharp from 'sharp';

import { BUCKET_NAME, storage } from './index.js';

export const resizeImage = async (dir: string, filename: string) => {
  const restaurant = await import(path.join(dir, filename));

  const bucket = storage.bucket(BUCKET_NAME);

  const titleFileName = restaurant.meta.title.toLowerCase().replace(/[^a-z]+/, '');

  const file = bucket.file(`images/${titleFileName}.webp`);
  const existsArray = await file.exists();
  const exists = existsArray[0];

  if (!exists) {
    const remoteWriteStream = bucket.file(`images/${titleFileName}.webp`).createWriteStream();

    const res = await fetch(restaurant.meta.imgUrl);
    const buffer = await res.arrayBuffer();
    await new Promise<void>((resolve, reject) => {
      sharp(buffer)
        .on('error', (err) => {
          console.error(dir, filename, err);
          reject();
        })
        .on('finish', () => {
          resolve();
        })
        .on('end', () => {
          console.log('end on ' + dir, filename);
          resolve();
        })
        .on('close', () => {
          console.log('close on ' + dir, filename);
          resolve();
        })
        .resize(400, 300, {
          fit: 'cover',
        })
        .withMetadata()
        .webp({
          quality: 70,
        })
        .pipe(remoteWriteStream);
    });
  }
};
