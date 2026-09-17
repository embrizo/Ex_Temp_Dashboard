import { useState } from 'react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import OverviewPage from './pages/OverviewPage';
import AnalysisPage from './pages/AnalysisPage';
import HeatmapPage from './pages/HeatmapPage';
import AlertsPage from './pages/AlertsPage';

import TopBar from './components/hierarchy/TopBar';
import CustomersPage from './pages/hierarchy/CustomersPage';
import FactoriesPage from './pages/hierarchy/FactoriesPage';
import LinesPage from './pages/hierarchy/LinesPage';
import MachinesPage from './pages/hierarchy/MachinesPage';
import SensorsPage from './pages/hierarchy/SensorsPage';
import SensorDetailPage from './pages/hierarchy/SensorDetailPage';

function LegacyDashboard() {
  const { stats } = useData();
  const hasData = Boolean(stats);
  const [page, setPage] = useState('upload');

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

function HierarchyLayout() {
  return (
    <>
      <TopBar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/legacy"
          element={
            <DataProvider>
              <LegacyDashboard />
            </DataProvider>
          }
        />
        <Route element={<HierarchyLayout />}>
          <Route path="/" element={<CustomersPage />} />
          <Route path="/c/:customerId" element={<FactoriesPage />} />
          <Route path="/c/:customerId/f/:factoryId" element={<LinesPage />} />
          <Route path="/c/:customerId/f/:factoryId/l/:lineId" element={<MachinesPage />} />
          <Route path="/c/:customerId/f/:factoryId/l/:lineId/m/:machineId" element={<SensorsPage />} />
          <Route
            path="/c/:customerId/f/:factoryId/l/:lineId/m/:machineId/s/:sensorId"
            element={<SensorDetailPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
