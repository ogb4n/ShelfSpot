"use client";
import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  type: "income" | "outcome";
  amount: number;
  description: string;
}

interface WalletTransactionsProps {
  walletId: string;
}

export const WalletTransactions = ({ walletId }: WalletTransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(
          `/api/accounting/wallet/transactions?walletId=${walletId}`
        );
        if (!response.ok) {
          console.error("Error fetching transactions");
          return;
        }
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [walletId]);

  if (loading) return <div>Loading transactions...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id}>
            <td>{tx.type}</td>
            <td>{tx.amount}</td>
            <td>{tx.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
