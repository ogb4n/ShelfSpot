import React, { useState } from "react";

/**
 * Props interface for the AddWalletForm component
 */
interface AddWalletFormProps {
  userId: number; // ID of the user creating the wallet
}

/**
 * Component for creating a new wallet
 *
 * This form allows users to add a new wallet with a name and initial balance.
 *
 * @param {AddWalletFormProps} props - Component props
 * @returns {JSX.Element} Rendered form component
 */
export const AddWalletForm: React.FC<AddWalletFormProps> = ({ userId }) => {
  // State for form input values
  const [walletName, setWalletName] = useState("");
  const [baseBalance, setBaseBalance] = useState<number>(0);

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * Handles form submission - creates a new wallet via API
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission

    // Set UI state to loading and clear previous messages
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Send API request to create a new wallet
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

      // Set success state and reset form values
      setSuccess(true);
      setWalletName("");
      setBaseBalance(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Display error message
      setError(err.message || "An error occurred.");
    }

    // End loading state regardless of outcome
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
