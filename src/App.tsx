import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WaiterView } from './views/WaiterView';
import { AdminView } from './views/AdminView';
import { BulkUploadView } from './views/BulkUploadView';
import { HotKitchenView } from './views/HotKitchenView';
import { BarView } from './views/BarView';
import { ColdKitchenView } from './views/ColdKitchenView';
import { LoginView } from './views/LoginView';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CompletedOrdersWidget } from './components/completed-orders/CompletedOrdersWidget';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginView />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Navigation />
              <div className="pt-16">
                <Routes>
                  <Route path="/" element={<Navigate to="/mesero" replace />} />
                  <Route path="/mesero" element={<WaiterView />} />
                  <Route path="/cocina-caliente" element={<HotKitchenView />} />
                  <Route path="/barra" element={<BarView />} />
                  <Route path="/cocina-fria" element={<ColdKitchenView />} />
                  <Route path="/admin" element={<AdminView />} />
                  <Route path="/admin/carga-masiva" element={<BulkUploadView />} />
                </Routes>
              </div>
              <CompletedOrdersWidget />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
