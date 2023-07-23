import sharp from 'sharp';

import { BUCKET_NAME, storage } from '../index.js';

interface ResizeImageOptions {
  size: {
    width: number;
    height: number;
  };
  quality: number;
}

export default async (imageUrl: string, imageName: string, options: ResizeImageOptions) => {
  const bucket = storage.bucket(BUCKET_NAME);

  const titleFileName = imageName.toLowerCase().replace(/[^a-z]+/, '');

  const file = bucket.file(`images/${titleFileName}-q${options.quality}.webp`);
  const existsArray = await file.exists();
  const exists = existsArray[0];

  if (!exists) {
    if (!imageUrl) {
      return '';
    }

    const res = await fetch(imageUrl);
    const imageBuffer = await res.arrayBuffer();

    const writeStream = bucket.file(`images/${titleFileName}-q${options.quality}.webp`).createWriteStream();

    await new Promise<void>((resolve, reject) => {
      sharp(imageBuffer)
        .on('error', (err) => {
          console.error(titleFileName, err);
          reject();
        })
        .on('end', () => {
          resolve();
        })
        .on('finish', () => {
          resolve();
        })
        .resize(options.size.width, options.size.height, {
          fit: 'cover',
        })
        .withMetadata()
        .webp({
          quality: options.quality,
        })
        .pipe(writeStream);
    });
  }

  const [url] = await file.getSignedUrl({ action: 'read', expires: '01-01-2026' });
  return url;
};
