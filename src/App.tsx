import React, { useEffect } from 'react';
import { Layout } from './components/Layout';
import { Properties } from './pages/Properties';
import { MortgageCalculator } from './pages/MortgageCalculator';
import { Settings } from './pages/Settings';
import { useStore } from './store/useStore';

function App() {
  const { currentTab, settings } = useStore();

  // Apply dark mode class to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'properties':
        return <Properties />;
      case 'calculator':
        return <MortgageCalculator />;
      case 'settings':
        return <Settings />;
      default:
        return <Properties />;
    }
  };

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;