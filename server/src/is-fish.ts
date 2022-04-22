import fetch from 'node-fetch';

export const isFish = (description: string | null | undefined, fishes: string[]) => {
  if (!description) {
    return false;
  }
  const isFish = fishes.map(fish => description.toLowerCase().includes(fish) || description.toLowerCase().includes('fisk'));
  return isFish.includes(true);
};

export const fetchFishes = async () => {
  const res = await fetch("https://sv.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Kategori:Matfiskar&cmlimit=64&origin=*");
  const data = await res.json();
  const fishData = data.query.categorymembers;
  const fishes: string[] = [];
  fishData.map((fish: { title: string; }) => {
    if (fish.title.toLowerCase().includes('lax')) {
      return fishes.push('lax');
    }
    return fishes.push(fish.title.toLowerCase());
  });
  return fishes;
};