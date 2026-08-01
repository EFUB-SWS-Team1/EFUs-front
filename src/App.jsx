import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LedgerCreatePage from "./pages/ledger/LedgerCreatePage";
import ExpensePage from "./pages/ledger/ExpensePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LedgerCreatePage />} />
          <Route path="ledger" element={<LedgerCreatePage />} />
          <Route path="expense" element={<ExpensePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}