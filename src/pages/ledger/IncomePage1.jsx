import "./IncomePage1.css";
import TransactionForm from "./components/TransactionForm";

export default function IncomePage1() {
  return (
    <TransactionForm
      transactionType="INCOME"
      mode="create"
      detailPath="/income-detail"
      containerClassName="expense-container"
      formClassName="expense-form"
      showTitle
    />
  );
}
