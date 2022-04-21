import Lottie from 'react-lottie';

import cooking from './cooking-pot.json';

export const SplashScreen = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: cooking,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };
  return (
    <div className="pot">
      <Lottie options={defaultOptions} height={400} width={400} />
    </div>
  );
};
