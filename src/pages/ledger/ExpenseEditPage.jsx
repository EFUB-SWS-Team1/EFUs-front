import "./ExpensePage.css";
import TransactionForm from "./components/TransactionForm";

export default function ExpenseEditPage() {
  return (
    <TransactionForm
      transactionType="EXPENSE"
      mode="edit"
      detailPath="/expense-detail"
      containerClassName="expense-container"
      formClassName="expense-form"
    />
  );
}
