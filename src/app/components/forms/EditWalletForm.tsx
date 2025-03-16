import { useState } from "react";

/**
 * Component for editing a wallet's name
 *
 * This form allows users to update the name of an existing wallet.
 *
 * @param {Object} props - Component props
 * @param {number} props.walletId - ID of the wallet to edit
 * @returns {JSX.Element} Rendered form component
 */
export const EditWalletForm = ({ walletId }: { walletId: number }) => {
  // State to store the new name input value
  const [name, setName] = useState("");

  /**
   * Handles form submission - saves the new wallet name to the API
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default browser form submission

    // Send API request to update the wallet name
    await fetch(`/api/accounting/wallet/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, walletId }),
    });

    // Note: This function doesn't handle success/error states or UI feedback
    // Consider adding state handling for better UX in production code
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
