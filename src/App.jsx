import { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import OverviewPage from './pages/OverviewPage';
import AnalysisPage from './pages/AnalysisPage';
import HeatmapPage from './pages/HeatmapPage';
import AlertsPage from './pages/AlertsPage';

function AppContent() {
  const { stats } = useData();
  const hasData = Boolean(stats);
  const [page, setPage] = useState('upload');

  const handleUploaded = () => {
    if (stats) setPage('overview');
  };

  const renderPage = () => {
    switch (page) {
      case 'upload':   return <UploadPage onUploaded={() => setPage('overview')} />;
      case 'overview': return <OverviewPage />;
      case 'analysis': return <AnalysisPage />;
      case 'heatmap':  return <HeatmapPage />;
      case 'alerts':   return <AlertsPage />;
      default:         return <UploadPage onUploaded={() => setPage('overview')} />;
    }
  };

  return (
    <>
      <Navbar activePage={page} setActivePage={setPage} hasData={hasData} />
      {renderPage()}
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
