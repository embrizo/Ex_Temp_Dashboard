import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TemplatesPage from './pages/TemplatesPage';
import OverviewPage from './pages/OverviewPage';
import AnalysisPage from './pages/AnalysisPage';
import HeatmapPage from './pages/HeatmapPage';
import AlertsPage from './pages/AlertsPage';

function AppContent() {
  const { activeSensorId } = useData();
  const [page, setPage] = useState('overview');
  const [homePage, setHomePage] = useState('sensors');

  const renderDashboardPage = () => {
    switch (page) {
      case 'overview': return <OverviewPage />;
      case 'analysis': return <AnalysisPage />;
      case 'heatmap':  return <HeatmapPage />;
      case 'alerts':   return <AlertsPage />;
      default:         return <OverviewPage />;
    }
  };

  if (!activeSensorId) {
    return (
      <>
        <Navbar activePage={homePage} setActivePage={setHomePage} isHome={true} />
        {homePage === 'sensors' ? <HomePage /> : <TemplatesPage />}
      </>
    );
  }

  return (
    <>
      <Navbar activePage={page} setActivePage={setPage} isHome={false} />
      {renderDashboardPage()}
    </>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
