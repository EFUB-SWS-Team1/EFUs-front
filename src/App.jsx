import { useState } from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LedgerCreatePage from "./pages/ledger/LedgerCreatePage";
import ExpensePage from "./pages/ledger/ExpensePage";
import ExpenseDetailPage from "./pages/ledger/ExpenseDetailPage";
import ExpenseEditPage from "./pages/ledger/ExpenseEditPage";
import IncomePage1 from "./pages/ledger/IncomePage1";
import IncomeDetailPage1 from "./pages/ledger/IncomeDetailPage1";
import IncomeEditPage from "./pages/ledger/IncomeEditPage";
import IncomePage2 from "./pages/ledger/IncomePage2";
import IncomeDetailPage2 from "./pages/ledger/IncomeDetailPage2";


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
          <Route path="/income" element={<IncomePage1 />} />
          <Route path="/income-detail" element={<IncomeDetailPage1 />} />
          <Route path="/income-edit" element={<IncomeEditPage />} />
          <Route path="/income2" element={<IncomePage2 />} />
          <Route path="/income-detail2" element={<IncomeDetailPage2 />} />
         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}