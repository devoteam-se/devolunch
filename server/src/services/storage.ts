import { Storage } from '@google-cloud/storage';

const BUCKET_NAME = 'devolunchv2';

const storage = new Storage({
  projectId: 'devolunch',
});

export const getScrape = async () => {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file('scrape.json').download();
  const scrape = JSON.parse(file[0].toString('utf8'));

  return scrape;
};
