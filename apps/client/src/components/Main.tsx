import { css } from '@emotion/react';

import Options from '@/components/Options';
import RestaurantGrid from '@/components/RestaurantGrid';
import { screenSize } from '@/utils/theme';

import { RestaurantGridProps } from '@devolunch/shared';
import { useEffect, useState } from 'react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { filterRestaurants } from '@/utils/filter-restaurants';
import { fetchAiSearch } from '@/utils/api';
import { mcpSearch } from '@/utils/mcp';

const mainStyles = css`
  display: flex;
  flex-direction: column;
  max-width: ${screenSize.extraLarge};
  margin: 0 auto;
  padding: 0 1.25rem 2rem;
`;

const optionsStyles = css`
  display: flex;
  height: 6rem;
  align-items: center;
  margin-left: auto;

  @media only screen and (max-width: ${screenSize.extraSmall}) {
    width: 100%;
    margin-left: 0;
    justify-content: space-between;
  }
`;

export default function Main({ restaurants }: RestaurantGridProps) {
  const { language } = useRestaurants();
  const [query, setQuery] = useState<string>('');
  const [filtered, setFiltered] = useState(restaurants);

  useEffect(() => setFiltered(restaurants), [restaurants]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Empty or very short queries show all, avoid server round-trips
      if (!query || query.trim().length < 2) {
        setFiltered(restaurants);
        return;
      }
      // Try direct MCP over WebSocket first
      let data = null as Awaited<ReturnType<typeof fetchAiSearch>> | null;
      try {
        const mcp = await mcpSearch(query, language, true);
        data = mcp;
      } catch (_) {
        // Fallback to REST bridge if WS/MCP is unavailable
        data = await fetchAiSearch(query, language, { expand: true });
      }
      if (!cancelled && data?.results?.length) {
        const titles = new Set(data.results.map((r) => r.restaurant.title));
        setFiltered(restaurants.filter((r) => titles.has(r.title)));
        return;
      }
      // Fallback to client-side filter if AI search fails or returns nothing
      if (!cancelled) setFiltered(filterRestaurants(restaurants, query, language));
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query, language, restaurants]);

  return (
    <main css={mainStyles}>
      <div css={optionsStyles}>
        <Options onQueryChange={setQuery} />
      </div>
      <RestaurantGrid restaurants={filtered} />
    </main>
  );
}
