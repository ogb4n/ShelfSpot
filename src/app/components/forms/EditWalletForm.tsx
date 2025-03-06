import { useState } from "react";

export const EditWalletForm = ({ walletId }: { walletId: number }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/accounting/wallet/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, walletId }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <p>New Wallet Name:</p>
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
