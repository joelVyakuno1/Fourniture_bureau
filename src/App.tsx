import * as React from "react";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MockDataProvider } from "./context/MockDataContext";
import { ToastProvider } from "./context/ToastContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { NewRequest } from "./pages/NewRequest";
import { Approvals } from "./pages/Approvals";
import { Inventory } from "./pages/Inventory";
import { StockManagement } from "./pages/StockManagement";

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <MockDataProvider>
        <ToastProvider>
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/demandes" element={<NewRequest />} />
                <Route path="/approbations" element={<Approvals />} />
                <Route path="/inventaire" element={<Inventory />} />
                <Route path="/stock" element={<StockManagement />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </ToastProvider>
      </MockDataProvider>
    </FluentProvider>
  );
}

export default App;
