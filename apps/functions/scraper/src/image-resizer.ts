import sharp from 'sharp';

import { BUCKET_NAME, storage } from './index.js';
import { RestaurantProps } from '@devolunch/shared';

export default async (restaurantMeta: RestaurantProps) => {
  const bucket = storage.bucket(BUCKET_NAME);

  const titleFileName = restaurantMeta.title.toLowerCase().replace(/[^a-z]+/, '');

  const file = bucket.file(`images/${titleFileName}.webp`);
  const existsArray = await file.exists();
  const exists = existsArray[0];

  if (!exists) {
    const remoteWriteStream = bucket.file(`images/${titleFileName}.webp`).createWriteStream();

    if (!restaurantMeta.imgUrl) {
      return '';
    }

    const res = await fetch(restaurantMeta.imgUrl);
    const buffer = await res.arrayBuffer();
    await new Promise<void>((resolve, reject) => {
      sharp(buffer)
        .on('error', (err) => {
          console.error(restaurantMeta.title, err);
          reject();
        })
        .on('finish', () => {
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

  const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2026' });
  return url;
};
