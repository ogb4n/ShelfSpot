"use client";
/**
 * Module de transactions de portefeuille (WalletTransactions)
 * 
 * Ce composant permet d'afficher et de gérer les transactions d'un portefeuille spécifique.
 * Il offre la possibilité de visualiser l'historique des transactions et de modifier leurs descriptions.
 * Les transactions sont classées par type (revenu ou dépense) et affichées dans un tableau.
 */
import { useEffect, useState } from "react";

/**
 * Interface définissant la structure d'une transaction
 * 
 * @property {string} id - Identifiant unique de la transaction
 * @property {string} type - Type de transaction, soit "income" (revenu) soit "outcome" (dépense)
 * @property {number} amount - Montant de la transaction
 * @property {string} description - Description détaillée de la transaction
 */
export interface Transaction {
  id: string;
  type: "income" | "outcome"; // Une transaction ne peut être que l'un de ces deux types
  amount: number;
  description: string;
}

/**
 * Interface définissant les propriétés du composant WalletTransactions
 * 
 * @property {string} walletId - Identifiant du portefeuille dont les transactions seront affichées
 */
interface WalletTransactionsProps {
  walletId: string; // ID du portefeuille dont les transactions seront affichées
}

/**
 * Composant d'affichage et de gestion des transactions d'un portefeuille
 * 
 * Ce composant récupère et affiche toutes les transactions d'un portefeuille spécifique.
 * Il permet également de modifier les descriptions des transactions.
 * 
 * @param {WalletTransactionsProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le composant rendu
 */
export const WalletTransactions = ({ walletId }: WalletTransactionsProps) => {
  // État pour stocker la liste des transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // État pour indiquer le chargement des données
  const [loading, setLoading] = useState<boolean>(true);
  // Suivi de la transaction en cours d'édition (si elle existe)
  const [editingId, setEditingId] = useState<string | null>(null);
  // Stockage de la nouvelle description pendant l'édition
  const [newDescription, setNewDescription] = useState<string>("");

  /**
   * Effet pour charger les transactions du portefeuille au montage du composant
   * ou lorsque l'ID du portefeuille change
   */
  useEffect(() => {
    /**
     * Récupère toutes les transactions pour le portefeuille spécifié
     * depuis l'API et met à jour l'état local
     */
    const fetchTransactions = async () => {
      try {
        // Requête des transactions pour ce portefeuille depuis l'API
        const response = await fetch(
          `/api/accounting/wallet/transactions?walletId=${walletId}`
        );
        if (!response.ok) {
          console.error("Error fetching transactions");
          return;
        }
        const data = await response.json();
        // Mise à jour de l'état avec les transactions reçues
        setTransactions(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        // Désactivation de l'indicateur de chargement, que la requête ait réussi ou échoué
        setLoading(false);
      }
    };

    // Exécution de la fonction de récupération
    fetchTransactions();
  }, [walletId]); // Rechargement si l'ID du portefeuille change

  /**
   * Configure le mode d'édition pour une transaction
   * 
   * @param {Transaction} tx - La transaction à éditer
   */
  const handleEditClick = (tx: Transaction) => {
    setEditingId(tx.id); // Marque cette transaction comme étant en cours d'édition
    setNewDescription(tx.description); // Initialise le champ d'édition avec la description actuelle
  };

  /**
   * Enregistre la description modifiée d'une transaction sur le serveur
   * 
   * @param {Transaction} tx - La transaction en cours d'édition
   */
  const handleSaveClick = async (tx: Transaction) => {
    // Choix du point d'accès API approprié en fonction du type de transaction
    const updateEndpoint =
      tx.type === "outcome"
        ? "/api/accounting/outcome/edit"
        : "/api/accounting/income/edit";
    try {
      // Envoi de la requête de mise à jour à l'API
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
        // Mise à jour de la liste des transactions avec la description modifiée
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
      // Sortie du mode d'édition et réinitialisation du champ de description
      setEditingId(null);
      setNewDescription("");
    }
  };

  // Affichage d'un indicateur de chargement pendant la récupération des données
  if (loading) return <div>Loading transactions...</div>;

  // Rendu du tableau des transactions
  return (
    <table>
      {/* En-tête du tableau */}
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Description</th>
        </tr>
      </thead>
      {/* Corps du tableau avec la liste des transactions */}
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx.id}>
            <td>{tx.type}</td>
            <td className="text-center">{tx.amount}</td>
            <td>
              {editingId === tx.id ? (
                // Affichage du formulaire d'édition si cette transaction est en cours d'édition
                <>
                  {/* Champ de saisie pour la nouvelle description */}
                  <input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                  {/* Bouton d'enregistrement des modifications */}
                  <button onClick={() => handleSaveClick(tx)}>Save</button>
                </>
              ) : (
                // Affichage de la description et du bouton d'édition si pas en mode édition
                <>
                  {tx.description}
                  {/* Bouton pour passer en mode édition */}
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
