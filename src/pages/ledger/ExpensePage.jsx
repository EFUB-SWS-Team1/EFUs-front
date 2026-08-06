import "./ExpensePage.css";
import TransactionForm from "./components/TransactionForm";

export default function ExpensePage() {
  return (
    <TransactionForm
      transactionType="EXPENSE"
      mode="create"
      detailPath="/expense-detail"
      containerClassName="expense-container"
      formClassName="expense-form"
      showTitle
    />
  );
}
