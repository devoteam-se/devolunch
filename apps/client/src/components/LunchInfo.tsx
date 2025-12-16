import { css } from '@emotion/react';
import ClockIcon from '@/assets/clock.svg?react';
import CookingIcon from '@/assets/cooking.svg?react';
import { color } from '@/utils/theme';
import { LunchMetadata } from '@devolunch/shared';

const lunchInfoContainerStyles = css`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${color.black};
  font-size: 0.875rem;
`;

const lunchInfoRowStyles = css`
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const lunchInfoIconStyles = css`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
  color: ${color.blackOlive};
`;

const infoIconStyles = css`
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  margin-top: 0.0625rem;
  flex-shrink: 0;
  color: ${color.blackOlive};
  font-size: 1rem;
  font-weight: bold;
  line-height: 1;
`;

const lunchInfoTextStyles = css`
  color: ${color.blackOlive};
  line-height: 1.5;
  margin: 0;
  font-weight: 500;
`;

const includedItemsStyles = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  align-items: center;
`;

const includedItemStyles = css`
  background: linear-gradient(135deg, ${color.white} 0%, rgba(255, 255, 255, 0.9) 100%);
  color: ${color.blackOlive};
  border: 1px solid rgba(60, 60, 58, 0.3);
  border-radius: 1rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(60, 60, 58, 0.05);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(60, 60, 58, 0.15);
  }
`;

const closureInfoStyles = css`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${color.black};
  font-size: 0.875rem;
`;

const closureTextStyles = css`
  color: #92400e;
  line-height: 1.5;
  margin: 0;
  font-weight: 600;
`;

const reopenTextStyles = css`
  color: #78350f;
  line-height: 1.5;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
  font-size: 0.8rem;
`;

interface LunchInfoProps {
  lunchInfo: LunchMetadata;
}

export default function LunchInfo({ lunchInfo }: LunchInfoProps) {
  const { servingTimes, includedItems, specialNotes, closureInfo } = lunchInfo;

  // If restaurant is closed, show closure info prominently
  if (closureInfo?.isClosed) {
    return (
      <div css={closureInfoStyles}>
        <p css={closureTextStyles}>
          {closureInfo.reason || 'Currently closed'}
        </p>
        {closureInfo.reopensOn && (
          <p css={reopenTextStyles}>
            Reopens {closureInfo.reopensOn}
          </p>
        )}
      </div>
    );
  }

  // Don't render if no lunch info is available
  if (!servingTimes && !includedItems?.length && !specialNotes) {
    return null;
  }

  return (
    <div css={lunchInfoContainerStyles}>
      {servingTimes && (
        <div css={lunchInfoRowStyles}>
          <ClockIcon css={lunchInfoIconStyles} />
          <p css={lunchInfoTextStyles}>{servingTimes}</p>
        </div>
      )}

      {includedItems && includedItems.filter(item => !item.toLowerCase().includes('vatten') && !item.toLowerCase().includes('water')).length > 0 && (
        <div css={lunchInfoRowStyles}>
          <CookingIcon css={lunchInfoIconStyles} />
          <div css={includedItemsStyles}>
            {includedItems
              .filter(item => !item.toLowerCase().includes('vatten') && !item.toLowerCase().includes('water'))
              .map((item: string, index: number) => (
                <span key={index} css={includedItemStyles}>
                  {item}
                </span>
              ))}
          </div>
        </div>
      )}

      {specialNotes && (
        <div css={lunchInfoRowStyles}>
          <span css={infoIconStyles}>
            ℹ
          </span>
          <p css={lunchInfoTextStyles}>{specialNotes}</p>
        </div>
      )}
    </div>
  );
}
