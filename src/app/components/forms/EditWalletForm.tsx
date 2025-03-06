import { useState } from "react";

export const EditWalletForm = ({ walletId }: { walletId: number }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...existing code...
    await fetch(`/api/accounting/wallet/edit?walletId=${walletId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        New Wallet Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <button type="submit">Save</button>
    </form>
  );
};
