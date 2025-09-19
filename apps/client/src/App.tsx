import { css, Global } from '@emotion/react';

import Header from '@/components/Header';
import Main from '@/components/Main';
import Footer from '@/components/Footer';
import ComponentErrorBoundary from '@/components/ComponentErrorBoundary';
import { useRestaurants } from '@/hooks/useRestaurants';
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
      {loading && !restaurants?.length ? (
        <LoadingSkeleton />
      ) : !loading && restaurants?.length ? (
        <>
          <ComponentErrorBoundary componentName="Header">
            <Header scrapeDate={scrapeDate} />
          </ComponentErrorBoundary>
          <ComponentErrorBoundary componentName="Main Content">
            <Main restaurants={restaurants} />
          </ComponentErrorBoundary>
          <ComponentErrorBoundary componentName="Footer">
            <Footer />
          </ComponentErrorBoundary>
        </>
      ) : (
        !loading && !restaurants.length && <div css={noRestaurantsStyles}>Come back later!</div>
      )}
    </>
  );
}

export default App;
