import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LedgerCreatePage from "./pages/ledger/LedgerCreatePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LedgerCreatePage />} />
          <Route path="ledger" element={<LedgerCreatePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}