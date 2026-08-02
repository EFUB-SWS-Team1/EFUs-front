import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LedgerCreatePage from "./pages/ledger/LedgerCreatePage";
import ExpensePage from "./pages/ledger/ExpensePage";
import ExpenseDetailPage from "./pages/ledger/ExpenseDetailPage";
import ExpenseEditPage from "./pages/ledger/ExpenseEditPage";
import IncomePage1 from "./pages/ledger/IncomePage1";
import IncomeDetailPage1 from "./pages/ledger/IncomeDetailPage1";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LedgerCreatePage />} />
          <Route path="ledger" element={<LedgerCreatePage />} />
          <Route path="expense" element={<ExpensePage />} />
          <Route path="/expense-detail" element={<ExpenseDetailPage />} />
          <Route path="/expense-edit" element={<ExpenseEditPage />} />
          <Route path="income" element={<IncomePage1 />} />
          <Route path="/income-detail" element={<IncomeDetailPage1 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}