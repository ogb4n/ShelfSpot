"use client";
/**
 * Module de formulaire d'ajout de revenu
 * 
 * Ce composant permet à l'utilisateur d'enregistrer un nouveau revenu sur un de ses portefeuilles.
 * Il offre une interface pour sélectionner le portefeuille, saisir le montant et ajouter une description.
 * Le formulaire communique avec l'API pour persister les données.
 */
import React, { useState, useEffect } from "react";

/**
 * Interface définissant les propriétés du composant AddIncomeForm
 * 
 * @property {number} userId - L'identifiant de l'utilisateur qui ajoute le revenu
 */
interface AddIncomeFormProps {
  userId: number;
}

/**
 * Composant de formulaire d'ajout de revenu
 * Permet à l'utilisateur d'enregistrer un nouveau revenu sur un portefeuille existant
 * 
 * @param {AddIncomeFormProps} props - Les propriétés du composant
 * @returns {JSX.Element} - Le formulaire rendu
 */
export const AddIncomeForm: React.FC<AddIncomeFormProps> = ({ userId }) => {
  // États pour les champs du formulaire
  const [walletId, setWalletId] = useState<number>(0); // Portefeuille sélectionné
  const [amount, setAmount] = useState<number>(0); // Montant du revenu
  const [description, setDescription] = useState(""); // Description du revenu
  
  // États pour la gestion de l'interface utilisateur
  const [loading, setLoading] = useState(false); // Indicateur de chargement
  const [error, setError] = useState(""); // Message d'erreur
  const [success, setSuccess] = useState(false); // Indicateur de succès
  
  // Liste des portefeuilles disponibles pour l'utilisateur
  const [wallets, setWallets] = useState<{ id: number; name: string }[]>([]);

  /**
   * Effet pour charger les portefeuilles de l'utilisateur au montage du composant
   * Ces portefeuilles seront présentés dans le menu déroulant
   */
  useEffect(() => {
    /**
     * Récupère les portefeuilles de l'utilisateur depuis l'API
     */
    const fetchWallets = async () => {
      try {
        // Requête API pour obtenir les portefeuilles de l'utilisateur
        const res = await fetch(
          `/api/accounting/wallet/personnal?userId=${userId}`
        );
        const data = await res.json();
        setWallets(data);
      } catch (err) {
        console.error(err);
      }
    };
    
    // Exécution de la fonction de chargement
    fetchWallets();
  }, [userId]); // Dépendance à l'userId pour recharger si celui-ci change

  /**
   * Gère la soumission du formulaire - crée une nouvelle transaction de revenu via l'API
   * @param {React.FormEvent} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le comportement par défaut du navigateur

    // Mise à jour de l'état de l'interface pour le chargement et effacement des messages précédents
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Envoi de la requête API pour créer une nouvelle transaction de revenu
      const response = await fetch("/api/accounting/income/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, amount, description }),
      });

      // Vérification du succès de la requête
      if (!response.ok) {
        throw new Error("Failed to create income.");
      }

      // Mise à jour de l'état pour indiquer le succès et réinitialisation des champs
      setSuccess(true);
      setWalletId(0);
      setAmount(0);
      setDescription("");

    // Gestion des exceptions avec typage plus souple pour l'erreur
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // Affichage du message d'erreur
      setError(err.message || "An error occurred.");
    } finally {
      // Fin de l'état de chargement quel que soit le résultat
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Menu déroulant pour la sélection du portefeuille */}
      <select
        value={walletId}
        onChange={(e) => setWalletId(Number(e.target.value))}
      >
        <option value={0} disabled>
          Select a wallet
        </option>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      {/* Champ de saisie pour le montant du revenu */}
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      {/* Zone de texte pour la description du revenu */}
      <textarea
        placeholder="Income Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* Bouton de soumission avec état de chargement */}
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Income"}
      </button>

      {/* Messages d'erreur et de succès */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Income added successfully!</p>}
    </form>
  );
};
