import React from 'react';

export const useProgressiveImg = (
  lowQualitySrc: string | undefined,
  highQualitySrc: string,
): {
  src: string;
  blur?: boolean;
} => {
  const [src, setSrc] = React.useState(lowQualitySrc ? lowQualitySrc : highQualitySrc);

  React.useEffect(() => {
    setSrc(lowQualitySrc ? lowQualitySrc : highQualitySrc);
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
    };
  }, [lowQualitySrc, highQualitySrc]);

  return {
    src: src,
    blur: src === (lowQualitySrc ? lowQualitySrc : highQualitySrc),
  };
};
