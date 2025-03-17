"use client";
/**
 * Module de gestion des portefeuilles (WalletManager)
 * 
 * Ce composant permet à l'utilisateur de gérer ses portefeuilles financiers.
 * Il offre les fonctionnalités suivantes :
 * - Affichage de la liste des portefeuilles de l'utilisateur
 * - Consultation du solde de chaque portefeuille
 * - Création d'un nouveau portefeuille
 * - Édition des informations d'un portefeuille existant
 * - Suppression d'un portefeuille
 * - Enregistrement des revenus et dépenses
 * - Consultation de l'historique des transactions
 */
import { useEffect, useState } from "react";
import { Stack } from "@mui/joy"; // Composant de pile pour l'organisation verticale des éléments
import { useSession } from "next-auth/react"; // Hook pour accéder à la session utilisateur
import { AddWalletForm } from "./forms/AddWalletForm"; // Formulaire d'ajout de portefeuille
import { BasicModal } from "./shared/BasicModal"; // Composant de modal réutilisable
import { BorderColorIcon, FolderOpenIcon } from "../utils/icons"; // Icônes pour les actions
import Table from "@mui/joy/Table"; // Composant tableau de Joy UI
import Sheet from "@mui/joy/Sheet"; // Conteneur stylisé de Joy UI
import { WalletTransactions } from "./WalletTransactions"; // Composant d'affichage des transactions
import { EditWalletForm } from "./forms/EditWalletForm"; // Formulaire d'édition de portefeuille
import { AddOutcomeForm } from "./forms/AddOutcomeForm"; // Formulaire d'ajout de dépense
import { AddIncomeForm } from "./forms/AddIncomeForm"; // Formulaire d'ajout de revenu

/**
 * Interface définissant la structure d'un portefeuille
 * @property {string} id - Identifiant unique du portefeuille
 * @property {string} name - Nom du portefeuille
 * @property {number} balance - Solde actuel du portefeuille
 */
interface Wallet {
  id: string;
  name: string;
  balance: number;
}

/**
 * Composant de gestion des portefeuilles
 * Permet de visualiser, créer, modifier et supprimer des portefeuilles
 * ainsi que de gérer les transactions associées
 * 
 * @returns {JSX.Element} - Le composant rendu
 */
export const WalletManager = () => {
  // Récupération des données de session pour l'authentification
  const { data: session } = useSession();
  // État local pour stocker la liste des portefeuilles de l'utilisateur
  const [wallets, setWallets] = useState<Wallet[]>([]);

  /**
   * Gère la suppression d'un portefeuille
   * Envoie une requête API pour supprimer le portefeuille et met à jour l'état local
   * 
   * @param {number} walletId - L'identifiant du portefeuille à supprimer
   */
  const handleDelete = async (walletId: number) => {
    // Appel à l'API pour supprimer le portefeuille
    await fetch(`/api/accounting/wallet/delete?walletId`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletId }),
    });
    // Mise à jour de l'état local en retirant le portefeuille supprimé du tableau
    // Utilisation de parseInt pour convertir l'ID de string en number pour la comparaison
    setWallets(wallets.filter((wallet) => parseInt(wallet.id) !== walletId));
  };

  /**
   * Effet pour charger les portefeuilles de l'utilisateur lors du chargement
   * du composant ou lorsque la session change
   */
  useEffect(() => {
    // Vérification que la session est chargée et que l'utilisateur est identifié
    if (session?.user && "id" in session.user) {
      /**
       * Récupère les portefeuilles de l'utilisateur depuis l'API
       * Cette fonction est appelée au chargement du composant et lorsque la session change
       */
      const fetchWallets = async () => {
        try {
          // Appel à l'API pour récupérer les portefeuilles de l'utilisateur connecté
          const response = await fetch(
            `/api/accounting/wallet/personnal?userId=${session.user.id}`
          );
          
          // Vérification du succès de la requête
          if (!response.ok) {
            console.error("Erreur lors de la récupération des wallets");
            return;
          }
          
          // Traitement de la réponse et mise à jour de l'état
          const data = await response.json();
          setWallets(data);
        } catch (error) {
          // Gestion des erreurs réseau ou de traitement
          console.error("Erreur fetch:", error);
        }
      };

      // Exécution de la fonction de chargement
      fetchWallets();
    }
  }, [session]); // Dépendance à la session pour recharger les données si l'utilisateur change

  // Affichage d'un message de chargement si la session n'est pas encore disponible
  if (!session) return <div>Loading...</div>;

  // Rendu du composant
  return (
    <Stack sx={{ width: "400px" }} gap={1}>
      {/* Titre de la section */}
      <h1 className="text-xl font-bold">Your active wallets</h1>
      
      {/* Conteneur stylisé pour le tableau des portefeuilles */}
      <Sheet
        variant="solid"
        color="primary"
        invertedColors
        sx={(theme) => ({
          pt: 1,
          borderRadius: "sm",
          transition: "0.3s",
          background: `linear-gradient(45deg, ${theme.vars.palette.primary[500]}, ${theme.vars.palette.primary[400]})`, // Dégradé de couleur
          "& tr:last-child": {
            "& td:first-child": {
              borderBottomLeftRadius: "8px", // Arrondissement des coins
            },
            "& td:last-child": {
              borderBottomRightRadius: "8px", // Arrondissement des coins
            },
          },
        })}
      >
        {/* Tableau des portefeuilles */}
        <Table stripe="odd" hoverRow>
          {/* En-têtes du tableau */}
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Wallet name</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          {/* Corps du tableau avec la liste des portefeuilles */}
          <tbody>
            {wallets.map((wallet) => (
              <tr key={wallet.id}>
                <td>{wallet.name}</td>
                <td>{wallet.balance}</td>
                <td>
                  {/* Actions disponibles pour chaque portefeuille */}
                  <Stack direction="row" spacing={1}>
                    {/* Modal pour éditer un portefeuille */}
                    <BasicModal
                      openLabel=""
                      icon={<BorderColorIcon sx={{ width: 16 }} />}
                      modalTitle="wallet.edition"
                      modalLabel="Edit wallet informations"
                    >
                      <EditWalletForm walletId={parseInt(wallet.id)} />
                    </BasicModal>
                    
                    {/* Modal pour voir les détails et transactions d'un portefeuille */}
                    <BasicModal
                      openLabel=""
                      icon={<FolderOpenIcon sx={{ width: 16 }} />}
                      modalTitle="wallet.name"
                      modalLabel="Wallet informations"
                    >
                      {/* Composant d'affichage des transactions avec conversion d'ID */}
                      <WalletTransactions walletId={wallet.id.toString()} />
                      
                      {/* Bouton de suppression avec conversion de l'ID en nombre */}
                      <button
                        type="button"
                        onClick={() => handleDelete(parseInt(wallet.id))}
                        className="text-center text-red-500 hover:text-red-800"
                      >
                        Delete this wallet
                      </button>
                    </BasicModal>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
      
      {/* Section des boutons d'action pour ajouter des éléments */}
      <Sheet sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
        {/* Modal pour ajouter un nouveau portefeuille */}
        <BasicModal
          openLabel="Add wallet"
          modalTitle="Add a new wallet"
          modalLabel="You can add a new wallet to your account by filling out the form below."
        >
          {/* Formulaire d'ajout de portefeuille avec ID utilisateur converti en nombre */}
          <AddWalletForm userId={parseInt(session.user.id as string)} />
        </BasicModal>
        
        {/* Modal pour ajouter un nouveau revenu */}
        <BasicModal openLabel="New Income" modalTitle="" modalLabel="">
          {/* Formulaire d'ajout de revenu avec ID utilisateur converti en nombre */}
          <AddIncomeForm userId={parseInt(session.user.id as string)} />
        </BasicModal>
        
        {/* Modal pour ajouter une nouvelle dépense */}
        <BasicModal openLabel="New Outcome" modalTitle="" modalLabel="">
          {/* Formulaire d'ajout de dépense avec ID utilisateur converti en nombre */}
          <AddOutcomeForm userId={parseInt(session.user.id as string)} />
        </BasicModal>
      </Sheet>
    </Stack>
  );
};
