import { css, Global } from '@emotion/react';

import Header from '@/components/Header';
import Main from '@/components/Main';
import Footer from '@/components/Footer';
import SplashScreen from '@/components/SplashScreen';
import { useRestaurants } from '@/contexts/restaurants';
import { color } from './utils/theme';

const globalStyles = css`
  body {
    background-color: ${color.ivory};
    height: 100vh;
    margin: 0;
    font-family: 'Open Sans', sans-serif, 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 0.875rem;
  }
`;

function App() {
  const { restaurants, scrapeDate, loading } = useRestaurants();

  return (
    <>
      <Global styles={globalStyles} />
      {loading ? (
        <SplashScreen />
      ) : (
        <>
          <Header scrapeDate={scrapeDate} />
          <Main restaurants={restaurants} />
          <Footer />
        </>
      )}
    </>
  );
}

export default App;
