import { useCallback, useState } from 'react';
import { css } from '@emotion/react';
import { useRestaurants } from '@/hooks/useRestaurants';
import { fetchAiSuggestions } from '@/utils/api';
import { mcpSearch, mcpSuggestMeal } from '@/utils/mcp';
import type { PromptSuggestion } from '@/types/ai';
import type { DishProps, RestaurantProps } from '@devolunch/shared';
import ConversationArea, { type ConversationMessage } from './ConversationArea';
import MenuModal from './MenuModal';
import SuggestionList from './SuggestionList';
import SearchInput from './SearchInput';

const container = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Fill the full viewport height below the header (5.625rem) */
  min-height: calc(100vh - 5.625rem);
  padding: 2rem 1rem 2rem;
  text-align: center;
  overflow-x: hidden; /* Prevent horizontal overflow */

  &.with-conversation {
    align-items: flex-start;
    padding-top: 2rem;
  }

  @media (max-width: 768px) {
    min-height: calc(100vh - 5rem);
    padding: 1rem 0.5rem;

    &.with-conversation {
      padding-top: 1rem;
    }
  }
`;

const inner = css`
  max-width: 56rem;
  width: 100%;
  /* Nudge slightly above true center when no conversation */
  transform: translateY(-6vh);
  /* Prevent content from touching edges */
  box-sizing: border-box;

  &.with-conversation {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    max-width: calc(100vw - 2rem);
    transform: translateY(-4vh);

    &.with-conversation {
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    max-width: calc(100vw - 1rem);
  }
`;

const title = css`
  font-family: 'Azeret Mono', monospace;
  font-size: 2.25rem;
  font-weight: 500;
  margin: 0 0 1rem;

  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin: 0 0 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;


interface PromptPanelProps {
  language?: string;
}

export default function PromptPanel({
  language = 'sv',
}: PromptPanelProps) {
  const { restaurants } = useRestaurants();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [hasActiveConversation, setHasActiveConversation] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  const [menuModal, setMenuModal] = useState<RestaurantProps | null>(null);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setError(null);
  }, []);

  const buildPromptSuggestions = useCallback((
    matches: RestaurantProps[],
    extras: { restaurant: string; dish?: string; reason?: string }[] = [],
    limit = 3
  ): PromptSuggestion[] => {
    return matches.slice(0, limit).map((restaurant) => {
      const extra = extras.find((s) => s.restaurant === restaurant.title);
      const fallbackDish = restaurant.dishCollection?.[0]?.dishes?.[0]?.title;
      return {
        title: restaurant.title,
        highlight: extra?.dish ?? fallbackDish,
        reason: extra?.reason,
        url: restaurant.url,
        googleMapsUrl: restaurant.googleMapsUrl,
        imageUrl: restaurant.imageUrlLowQuality || restaurant.imageUrl,
        location: restaurant.locations?.[0]?.title,
        distanceKm: restaurant.distance,
      } satisfies PromptSuggestion;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || isSearching) return;

    setError(null);
    setIsSearching(true);

    // Queue conversation entries
    const timestamp = Date.now();
    const trimmedQuery = query.trim();
    const userMessage: ConversationMessage = {
      id: timestamp.toString(),
      type: 'user',
      content: trimmedQuery,
      timestamp: new Date(),
    };

    const loadingMessage: ConversationMessage = {
      id: `${timestamp}-loading`,
      type: 'loading',
      content: language === 'sv' ? 'Letar efter restauranger...' : 'Looking for restaurants...',
      timestamp: new Date(),
    };

    setMessages(prev => {
      const withoutLoading = prev.filter((m) => m.type !== 'loading');
      return [...withoutLoading, userMessage, loadingMessage];
    });
    setHasActiveConversation(true);

    // Add to conversation context
    setConversationContext(prev => [...prev, trimmedQuery]);

    // Clear the input
    setQuery('');

    try {
      let responseText = '';
      let suggestions: PromptSuggestion[] = [];

      if (trimmedQuery.length < 2) {
        responseText = language === 'sv'
          ? 'Skriv gärna lite mer så att jag kan ge dig bättre rekommendationer!'
          : 'Please add a few more words so I can give you better recommendations!';
      } else {
        // Create contextual query including conversation history
        const contextualQuery = conversationContext.length > 0
          ? `Previous requests: ${conversationContext.slice(-2).join(', ')}. Current request: ${trimmedQuery}`
          : trimmedQuery;

        // Try AI suggestions first
        try {
          const aiSuggestions = await mcpSuggestMeal(contextualQuery, language, 3, true);
          if (aiSuggestions?.results?.length) {
            const suggestedRestaurants = new Set(aiSuggestions.results.map((s) => s.restaurant));
            const aiFiltered = restaurants.filter((r) => suggestedRestaurants.has(r.title));
            if (aiFiltered.length) {
              suggestions = buildPromptSuggestions(aiFiltered, aiSuggestions.results, 3);
              responseText = conversationContext.length > 0
                ? (language === 'sv'
                  ? `Baserat på vår konversation hittade jag nya rekommendationer för "${trimmedQuery}":`
                  : `Based on our conversation, I found new recommendations for "${trimmedQuery}":`)
                : (language === 'sv'
                  ? `Jag hittade några ställen som matchar "${trimmedQuery}". Här är mina bästa rekommendationer:`
                  : `I found some places that match "${trimmedQuery}". Here are my top recommendations:`);
            }
          }
        } catch (_) {
          // Fallback to regular AI search
          try {
            const aiSearchResults = await fetchAiSuggestions(contextualQuery, language, { topK: 3, useLLM: true });
            if (aiSearchResults?.results?.length) {
              const suggestedRestaurants = new Set(aiSearchResults.results.map((s) => s.restaurant));
              const aiFiltered = restaurants.filter((r) => suggestedRestaurants.has(r.title));
              if (aiFiltered.length) {
                suggestions = buildPromptSuggestions(aiFiltered, aiSearchResults.results, 3);
                responseText = conversationContext.length > 0
                  ? (language === 'sv'
                    ? `Baserat på vår konversation hittade jag nya rekommendationer för "${trimmedQuery}":`
                    : `Based on our conversation, I found new recommendations for "${trimmedQuery}":`)
                  : (language === 'sv'
                    ? `Jag hittade några ställen som matchar "${trimmedQuery}". Här är mina bästa rekommendationer:`
                    : `I found some places that match "${trimmedQuery}". Here are my top recommendations:`);
              }
            }
          } catch (_) {
            // Final fallback to dish search
            try {
              const searchData = await mcpSearch(contextualQuery, language, true);
              if (searchData?.results?.length) {
                const titles = new Set(searchData.results.map((r) => r.restaurant.title));
                const searchFiltered = restaurants.filter((r) => titles.has(r.title));
                if (searchFiltered.length) {
                  const extras = searchData.results.map((item) => {
                    const topDish = (item.dishes as DishProps[] | undefined)?.[0]?.title;
                    return {
                      restaurant: item.restaurant.title,
                      dish: topDish,
                      reason: item.reason,
                    };
                  });
                  suggestions = buildPromptSuggestions(searchFiltered, extras, 3);
                  responseText = conversationContext.length > 0
                    ? (language === 'sv'
                      ? `Baserat på vår konversation hittade jag restauranger för "${trimmedQuery}":`
                      : `Based on our conversation, I found restaurants for "${trimmedQuery}":`)
                    : (language === 'sv'
                      ? `Jag hittade restauranger med rätter som matchar "${trimmedQuery}". Här är mina bästa rekommendationer:`
                      : `I found restaurants with dishes matching "${trimmedQuery}". Here are my top recommendations:`);
                }
              }
            } catch (_) {
              // No AI results available
            }
          }
        }

        if (!suggestions.length) {
          responseText = language === 'sv'
            ? `Tyvärr hittade jag inga specifika rekommendationer för "${trimmedQuery}". Prova att beskriva vad du är sugen på på ett annat sätt, eller kika på alla restauranger nedan.`
            : `Sorry, I couldn't find specific recommendations for "${trimmedQuery}". Try describing what you're craving differently, or check out all restaurants below.`;
        }
      }

      // Remove loading message and add AI response with suggestions inline
      setMessages(prev => {
        const withoutLoading = prev.filter((m) => m.type !== 'loading');
        const next: ConversationMessage[] = [
          ...withoutLoading,
          {
            id: `${timestamp}-ai`,
            type: 'ai',
            content: responseText,
            timestamp: new Date(),
          },
        ];

        if (suggestions.length) {
          next.push({
            id: `${timestamp}-suggestions`,
            type: 'suggestions',
            suggestions,
            timestamp: new Date(),
          });
        }

        return next;
      });

    } catch (_error) {
      setError(language === 'sv' ? 'Något gick fel vid sökning. Försök igen.' : 'Something went wrong. Please try again.');
      // Remove loading message on error
      setMessages(prev => prev.filter(m => m.id !== `${timestamp}-loading`));
    } finally {
      setIsSearching(false);
    }
  }, [query, isSearching, language, restaurants, conversationContext, buildPromptSuggestions]);

  const renderSuggestions = useCallback((suggestions: PromptSuggestion[], messageId: string) => {
    return (
      <SuggestionList
        suggestions={suggestions}
        messageId={messageId}
        restaurants={restaurants}
        language={language}
        onMenuModalOpen={setMenuModal}
      />
    );
  }, [restaurants, language]);

  return (
    <section className={hasActiveConversation ? 'with-conversation' : ''} css={container} aria-label='AI prompt'>
      <div className={hasActiveConversation ? 'with-conversation' : ''} css={inner}>
        <h2 css={title}>Vad vill du äta idag?</h2>

        <ConversationArea
          messages={messages}
          hasActiveConversation={hasActiveConversation}
          renderSuggestions={renderSuggestions}
        />

        <SearchInput
          query={query}
          isSearching={isSearching}
          error={error}
          onQueryChange={handleQueryChange}
          onSubmit={handleSubmit}
        />
      </div>


      {/* Menu Modal */}
      {menuModal && (
        <MenuModal
          restaurant={menuModal}
          language={language}
          onClose={() => setMenuModal(null)}
        />
      )}
    </section>
  );
}