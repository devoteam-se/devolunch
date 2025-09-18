import { Storage } from '@google-cloud/storage';

const BUCKET_NAME = 'devolunchv2';
const LOCAL_SCRAPER_URL = 'http://localhost:8081';

const storage = new Storage({
  projectId: 'devolunch',
});

const getLocalScrape = async () => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    // First try reading from local JSON file
    const localFilePath = path.join(process.cwd(), '..', 'functions', 'scraper', 'scrape.json');
    try {
      const fileContent = await fs.readFile(localFilePath, 'utf8');
      const scrapeData = JSON.parse(fileContent);
      console.log('Using cached local scraper data with', scrapeData.restaurants?.length || 0, 'restaurants');
      return scrapeData;
    } catch (_fileError) {
      console.log('Local JSON file not found, trying scraper endpoint...');
    }

    // Fallback to scraper endpoint if file doesn't exist
    const response = await fetch(`${LOCAL_SCRAPER_URL}/scrape`);
    if (!response.ok) {
      throw new Error(`Scraper responded with ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const scrapeData = (await response.json()) as { restaurants?: unknown[] };
      console.log('Using fresh local scraper data with', scrapeData.restaurants?.length || 0, 'restaurants');
      return scrapeData;
    }

    console.log('Local scraper returned non-JSON response, falling back to cloud storage');
    return null;
  } catch (error) {
    console.log('Local scraper not available, falling back to cloud storage:', (error as Error).message);
    return null;
  }
};

const getCloudScrape = async () => {
  const bucket = storage.bucket(BUCKET_NAME);
  const file = await bucket.file('scrape.json').download();
  const scrape = JSON.parse(file[0].toString('utf8'));
  return scrape;
};

export const getScrape = async () => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const localScrape = await getLocalScrape();
    if (localScrape) {
      return localScrape;
    }
  }

  return getCloudScrape();
};
