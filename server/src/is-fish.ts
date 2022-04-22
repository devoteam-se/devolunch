export const isFish = async (description: string | null | undefined) => {
  if (!description) {
    return false;
  }
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
  const isFish = fishes.map(fish => description.toLowerCase().includes(fish) || description.toLowerCase().includes('fisk'));
  console.log(isFish.includes(true));
  return isFish.includes(true);
};