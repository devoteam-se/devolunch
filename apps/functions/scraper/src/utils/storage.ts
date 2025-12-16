import { Storage } from '@google-cloud/storage';

export const BUCKET_NAME = 'devolunchv2';

export const storage = new Storage({
  projectId: 'devolunch',
});
