import { RestaurantProps } from '@devolunch/shared';

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

export function filterRestaurants(restaurants: RestaurantProps[], query: string, language?: string): RestaurantProps[] {
  const q = norm(query.trim());
  if (!q) return restaurants;

  return restaurants.filter((r) => {
    // Search in dish collections, preferring selected language when present
    const collections = r.dishCollection || [];
    const relevant = language ? collections.filter((c) => c.language === language) : collections;
    const scan = relevant.length ? relevant : collections;

    for (const col of scan) {
      for (const dish of col.dishes) {
        if (norm(dish.title).includes(q)) return true;
        if (dish.description && norm(dish.description).includes(q)) return true;
      }
    }

    // Fallback: also search restaurant title
    return norm(r.title).includes(q);
  });
}

