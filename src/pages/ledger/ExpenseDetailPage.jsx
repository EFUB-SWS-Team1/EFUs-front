import "./ExpenseDetailPage.css";
import TransactionDetail from "./components/TransactionDetail";

export default function ExpenseDetailPage() {
  return (
    <TransactionDetail
      transactionType="EXPENSE"
      editPath="/expense-edit"
    />
  );
}
