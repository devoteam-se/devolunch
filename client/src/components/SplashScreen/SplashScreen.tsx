import { useLottie } from 'lottie-react';
import steamPot from '../../assets/steam-pot.json';
import './SplashScreen.css';

export const SplashScreen = () => {
  const options = {
    animationData: steamPot,
    loop: true,
    autoplay: true,
  };

  const { View } = useLottie(options);
  return <div className="pot">{View}</div>;
};
