import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import { AppLayout } from "./components/AppLayout";
import { RouteGuard } from "./components/RouteGuard";

// Pages
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Fleet } from "./pages/Fleet";
import { Drivers } from "./pages/Drivers";
import { Trips } from "./pages/Trips";
import { Maintenance } from "./pages/Maintenance";
import { Expenses } from "./pages/Expenses";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login page */}
          <Route path="/login" element={<Login />} />

          {/* Authenticated dashboard routes wrapped in AppLayout */}
          <Route
            path="/*"
            element={
              <RouteGuard>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    
                    <Route
                      path="/fleet"
                      element={
                        <RouteGuard section="fleet">
                          <Fleet />
                        </RouteGuard>
                      }
                    />
                    
                    <Route
                      path="/drivers"
                      element={
                        <RouteGuard section="drivers">
                          <Drivers />
                        </RouteGuard>
                      }
                    />
                    
                    <Route
                      path="/trips"
                      element={
                        <RouteGuard section="trips">
                          <Trips />
                        </RouteGuard>
                      }
                    />
                    
                    <Route
                      path="/maintenance"
                      element={
                        <RouteGuard section="maintenance">
                          <Maintenance />
                        </RouteGuard>
                      }
                    />
                    
                    <Route
                      path="/expenses"
                      element={
                        <RouteGuard section="expenses">
                          <Expenses />
                        </RouteGuard>
                      }
                    />
                    
                    <Route
                      path="/analytics"
                      element={
                        <RouteGuard section="analytics">
                          <Analytics />
                        </RouteGuard>
                      }
                    />
                    
                    <Route
                      path="/settings"
                      element={
                        <RouteGuard section="settings">
                          <Settings />
                        </RouteGuard>
                      }
                    />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </RouteGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
