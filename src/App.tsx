import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './stores/store';
import { theme } from './config/theme';
import { AppLayout } from './components/Layout/AppLayout';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { MainPage } from './pages/Main';
import BillInquiryMenu from './pages/Bill/BillInquiryMenu';
import BillInquiryResult from './pages/Bill/BillInquiryResult';
import ProductChangeMenu from './pages/Product/ProductChangeMenu';
import ProductSelection from './pages/Product/ProductSelection';
import ProductRequest from './pages/Product/ProductRequest';
import ProductResult from './pages/Product/ProductResult';
import { useAuthRestore } from './hooks/useAuthRestore';
import './styles/globals.css';

function AppContent() {
  useAuthRestore();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/main" replace />} />
        <Route path="main" element={<MainPage />} />
        
        {/* Bill Routes */}
        <Route 
          path="bill/inquiry-menu" 
          element={<BillInquiryMenu />} 
        />
        <Route path="bill/inquiry-result" element={
          <ProtectedRoute requiredPermission="BILL_INQUIRY">
            <BillInquiryResult />
          </ProtectedRoute>
        } />
        
        {/* Product Routes */}
        <Route path="product/menu" element={<ProductChangeMenu />} />
        <Route path="product/selection" element={<ProductSelection />} />
        <Route path="product/request" element={
          <ProtectedRoute requiredPermission="PRODUCT_CHANGE">
            <ProductRequest />
          </ProtectedRoute>
        } />
        <Route path="product/result" element={
          <ProtectedRoute requiredPermission="PRODUCT_CHANGE">
            <ProductResult />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/main" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;