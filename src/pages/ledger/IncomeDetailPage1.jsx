import "./IncomeDetailPage1.css";
import TransactionDetail from "./components/TransactionDetail";

export default function IncomeDetailPage1() {
  return (
    <TransactionDetail
      transactionType="INCOME"
      editPath="/income-edit"
    />
  );
}
