import { useAsync } from "react-use";

export const useIsFish = (description: String) => {
  const { loading, value, error } = useAsync(async () => {
    const res = await fetch("https://sv.wikipedia.org/w/api.php?action=query&format=json&list=categorymembers&cmtitle=Kategori:Matfiskar&cmlimit=64&origin=*");
    const data = await res.json();
    const fishData = data.query.categorymembers;
    let fishes: string[] = []
    fishData.map((fish: { title: string; }) => {
      if(fish.title.includes('lax')) {
        return fishes.push('lax')
      } 
      return fishes.push(fish.title.toLowerCase())})
    const isFish = fishes.map(fish => description.toLowerCase().includes(fish))
    return isFish.includes(true)
  });

  return { isFish: value }

}

