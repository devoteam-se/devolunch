import { css, Global } from '@emotion/react';

import Header from '@/components/Header';
import Main from '@/components/Main';
import Footer from '@/components/Footer';
import { useRestaurants } from '@/contexts/restaurants';
import { color } from './utils/theme';
import LoadingSkeleton from './components/LoadingSkeleton';

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
      <>
        <Header scrapeDate={scrapeDate} />
        {loading && !restaurants?.length ? (
          <LoadingSkeleton />
        ) : !loading && restaurants?.length ? (
          <Main restaurants={restaurants} />
        ) : (
          !loading && !restaurants.length && <div css={noRestaurantsStyles}>Have not scraped any restaurants yet</div>
        )}
        <Footer />
      </>
    </>
  );
}

export default App;
