"use client";
import { useEffect, useState } from "react";

export interface Transaction {
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState<string>("");

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

  const handleEditClick = (tx: Transaction) => {
    setEditingId(tx.id);
    setNewDescription(tx.description);
  };

  const handleSaveClick = async (tx: Transaction) => {
    const updateEndpoint =
      tx.type === "outcome"
        ? "/api/accounting/outcome/edit"
        : "/api/accounting/income/edit";
    try {
      const response = await fetch(updateEndpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: Number(tx.id),
          description: newDescription,
        }),
      });
      if (response.ok) {
        const updated = await response.json();
        setTransactions((prev) =>
          prev.map((item) =>
            item.id === tx.id
              ? { ...item, description: updated.description }
              : item
          )
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEditingId(null);
      setNewDescription("");
    }
  };

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
            <td className="text-center">{tx.amount}</td>
            <td>
              {editingId === tx.id ? (
                <>
                  <input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                  <button onClick={() => handleSaveClick(tx)}>Save</button>
                </>
              ) : (
                <>
                  {tx.description}
                  <button onClick={() => handleEditClick(tx)}>Edit</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
