import "./IncomeEditPage.css";
import TransactionForm from "./components/TransactionForm";

export default function IncomeEditPage() {
  return (
    <TransactionForm
      transactionType="INCOME"
      mode="edit"
      detailPath="/income-detail"
      containerClassName="income-edit-container"
      formClassName="income-edit-form"
    />
  );
}
