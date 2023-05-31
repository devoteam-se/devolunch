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

const noRestaurantsStyles = css`
  font-size: 1.5rem;
  text-align: center;
  margin: 3rem 0;
`;

function App() {
  const { restaurants, scrapeDate, loading } = useRestaurants();

  return (
    <>
      <Global styles={globalStyles} />
      {loading ? (
        <SplashScreen />
      ) : !loading && restaurants?.length ? (
        <>
          <Header scrapeDate={scrapeDate} />
          <Main restaurants={restaurants} />
          <Footer />
        </>
      ) : (
        <div css={noRestaurantsStyles}>Have not scraped any restaurants yet</div>
      )}
    </>
  );
}

export default App;
