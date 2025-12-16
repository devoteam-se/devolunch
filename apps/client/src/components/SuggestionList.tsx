import { css } from '@emotion/react';
import { color } from '@/utils/theme';
import { formatDistance } from '@/utils/common';
import type { PromptSuggestion } from '@/types/ai';
import type { RestaurantProps } from '@devolunch/shared';

const suggestionsBubble = css`
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 12px;
  max-width: 100%;
  margin-left: 0;
  background: rgba(245, 245, 245, 0.7);
  color: #333;
  border-bottom-left-radius: 4px;
  word-wrap: break-word;
`;

const suggestionList = css`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const suggestionCard = css`
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  padding: 1rem;
  text-align: left;
  flex: 1;
  min-width: 280px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    min-width: auto;
    flex-direction: row;
    align-items: stretch;
    gap: 0.75rem;

    @media (max-width: 520px) {
      flex-direction: column;
    }
  }
`;

const suggestionImage = css`
  width: 100%;
  height: 180px;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    margin-bottom: 0;
    flex-shrink: 0;

    @media (max-width: 520px) {
      width: 100%;
      height: 160px;
      margin-bottom: 1rem;
    }
  }
`;

const suggestionImageFallback = css`
  width: 100%;
  height: 180px;
  border-radius: 12px;
  background: #f0f0f0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 2rem;

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
    margin-bottom: 0;
    flex-shrink: 0;
    font-size: 1.5rem;

    @media (max-width: 520px) {
      width: 100%;
      height: 160px;
      margin-bottom: 1rem;
      font-size: 2rem;
    }
  }
`;

const suggestionBody = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const suggestionTitle = css`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f1f1f;
`;

const suggestionMeta = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
`;

const suggestionHighlight = css`
  margin: 0;
  font-size: 0.9rem;
  color: #333;
`;

const suggestionLinkRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const suggestionLink = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${color.blue};
  color: ${color.blue};
  text-decoration: none;
  font-size: 0.85rem;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: ${color.blue};
    color: ${color.white};
  }
`;

interface SuggestionListProps {
  suggestions: PromptSuggestion[];
  messageId: string;
  restaurants: RestaurantProps[];
  language: string;
  onMenuModalOpen: (restaurant: RestaurantProps) => void;
}

export default function SuggestionList({
  suggestions,
  messageId,
  restaurants,
  language,
  onMenuModalOpen
}: SuggestionListProps) {
  return (
    <div css={suggestionsBubble}>
      <div css={suggestionList}>
        {suggestions.map((suggestion, index) => {
          const metaItems: string[] = [];
          if (suggestion.location) metaItems.push(suggestion.location);
          if (typeof suggestion.distanceKm === 'number') {
            metaItems.push(formatDistance(suggestion.distanceKm));
          }
          const fallbackInitial = suggestion.title ? suggestion.title.charAt(0).toUpperCase() : '?';

          return (
            <div key={`${messageId}-${index}`} css={suggestionCard}>
              {suggestion.imageUrl ? (
                <img
                  css={suggestionImage}
                  src={suggestion.imageUrl}
                  alt={suggestion.title}
                  loading='lazy'
                />
              ) : (
                <div css={suggestionImageFallback} aria-hidden='true'>
                  {fallbackInitial}
                </div>
              )}
              <div css={suggestionBody}>
                <h3 css={suggestionTitle}>{suggestion.title}</h3>
                {metaItems.length > 0 && (
                  <div css={suggestionMeta}>
                    {metaItems.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                )}
                {suggestion.highlight && (
                  <p css={suggestionHighlight}>
                    {suggestion.highlight}
                  </p>
                )}
                <div css={suggestionLinkRow}>
                  {(() => {
                    const restaurant = restaurants.find(r => r.title === suggestion.title);
                    const hasFullMenu = restaurant?.dishCollection?.some(dc => dc.dishes.length > 0);

                    return (
                      <>
                        {hasFullMenu && (
                          <button
                            css={css`
                              ${suggestionLink}
                              background: none;
                              border: 1px solid ${color.blue};
                              cursor: pointer;
                            `}
                            onClick={() => {
                              if (restaurant) {
                                onMenuModalOpen(restaurant);
                              }
                            }}
                          >
                            {language === 'sv' ? 'Visa hela menyn' : 'View full menu'}
                          </button>
                        )}
                        {suggestion.url && (
                          <a
                            css={suggestionLink}
                            href={suggestion.url}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {language === 'sv' ? 'Webbplats' : 'Website'}
                          </a>
                        )}
                        {suggestion.googleMapsUrl && (
                          <a
                            css={suggestionLink}
                            href={suggestion.googleMapsUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            {language === 'sv' ? 'Hitta hit' : 'Get directions'}
                          </a>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}