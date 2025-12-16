import { css, Global } from '@emotion/react';

import Header from '@/components/Header';
import Main from '@/components/Main';
import Footer from '@/components/Footer';
import ComponentErrorBoundary from '@/components/ComponentErrorBoundary';
import { useRestaurants } from '@/hooks/useRestaurants';
import { color } from './utils/theme';
import PromptPanel from './components/PromptPanel';
import ScrollToSection from './components/ScrollToSection';

const globalStyles = css`
  html {
    scroll-behavior: smooth;
  }
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
  const { restaurants, scrapeDate, loading, language } = useRestaurants();

  return (
    <>
      <Global styles={globalStyles} />
      <ComponentErrorBoundary componentName="Header">
        <Header scrapeDate={scrapeDate} />
      </ComponentErrorBoundary>
      <ComponentErrorBoundary componentName="Prompt">
        <PromptPanel language={language} />
      </ComponentErrorBoundary>
      <ScrollToSection
        targetSection="restaurants-section"
        label="Se vad som finns i närheten"
        ariaLabel="Se vad som finns i närheten"
      />
      <ComponentErrorBoundary componentName="Main Content">
        <Main restaurants={restaurants} />
      </ComponentErrorBoundary>
      {!loading && !restaurants.length && <div css={noRestaurantsStyles}>Come back later!</div>}
      <ComponentErrorBoundary componentName="Footer">
        <Footer />
      </ComponentErrorBoundary>
    </>
  );
}

export default App;
