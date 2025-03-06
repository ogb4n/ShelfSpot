import React, { useState } from "react";

interface AddWalletFormProps {
  userId: number;
}

export const AddWalletForm: React.FC<AddWalletFormProps> = ({ userId }) => {
  const [walletName, setWalletName] = useState("");
  const [baseBalance, setBaseBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const response = await fetch("/api/accounting/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: walletName,
          userId,
          balance: baseBalance,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to add wallet.");
      }
      setSuccess(true);
      setWalletName("");
      setBaseBalance(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="walletName">Wallet Name:</label>
        <input
          id="walletName"
          type="text"
          value={walletName}
          onChange={(e) => setWalletName(e.target.value)}
          required
        />
      </div>
      <div>
        {" "}
        <label htmlFor="baseBalance">Base Balance:</label>
        <input
          id="baseBalance"
          type="number"
          value={baseBalance}
          onChange={(e) => setBaseBalance(Number(e.target.value))}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Wallet"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Wallet added successfully!</p>}
    </form>
  );
};
