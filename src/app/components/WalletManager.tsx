"use client";
import { useEffect, useState } from "react";
import { Stack } from "@mui/joy";
import { useSession } from "next-auth/react";
import { AddWalletForm } from "./forms/AddWalletForm";
import { BasicModal } from "./shared/BasicModal";
import { BorderColorIcon, FolderOpenIcon } from "../utils/icons";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import { WalletTransactions } from "./WalletTransactions";
import { EditWalletForm } from "./forms/EditWalletForm";
import { AddOutcomeForm } from "./forms/AddOutcomeForm";
import { AddIncomeForm } from "./forms/AddIncomeForm";

// move to type file
interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export const WalletManager = () => {
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const handleDelete = async (walletId: number) => {
    await fetch(`/api/accounting/wallet/delete?walletId`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletId }),
    });
    setWallets(wallets.filter((wallet) => parseInt(wallet.id) !== walletId));
  };

  useEffect(() => {
    if (session?.user && "id" in session.user) {
      const fetchWallets = async () => {
        try {
          const response = await fetch(
            `/api/accounting/wallet/personnal?userId=${session.user.id}`
          );
          if (!response.ok) {
            console.error("Erreur lors de la récupération des wallets");
            return;
          }
          const data = await response.json();
          setWallets(data);
        } catch (error) {
          console.error("Erreur fetch:", error);
        }
      };

      fetchWallets();
    }
  }, [session]);

  if (!session) return <div>Loading...</div>;

  return (
    <Stack sx={{ width: "400px" }} gap={1}>
      <h1 className="text-xl font-bold">Your active wallets</h1>
      <Sheet
        variant="solid"
        color="primary"
        invertedColors
        sx={(theme) => ({
          pt: 1,
          borderRadius: "sm",
          transition: "0.3s",
          background: `linear-gradient(45deg, ${theme.vars.palette.primary[500]}, ${theme.vars.palette.primary[400]})`,
          "& tr:last-child": {
            "& td:first-child": {
              borderBottomLeftRadius: "8px",
            },
            "& td:last-child": {
              borderBottomRightRadius: "8px",
            },
          },
        })}
      >
        <Table stripe="odd" hoverRow>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Wallet name</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {wallets.map((wallet) => (
              <tr key={wallet.id}>
                <td>{wallet.name}</td>
                <td>{wallet.balance}</td>
                <td>
                  <Stack direction="row" spacing={1}>
                    <BasicModal
                      openLabel=""
                      icon={<BorderColorIcon sx={{ width: 16 }} />}
                      modalTitle="wallet.edition"
                      modalLabel="Edit wallet informations"
                    >
                      <EditWalletForm walletId={parseInt(wallet.id)} />
                    </BasicModal>
                    <BasicModal
                      openLabel=""
                      icon={<FolderOpenIcon sx={{ width: 16 }} />}
                      modalTitle="wallet.name"
                      modalLabel="Wallet informations"
                    >
                      <WalletTransactions walletId={wallet.id} />
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
      <Sheet sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
        <BasicModal
          openLabel="Add wallet"
          modalTitle="Add a new wallet"
          modalLabel="You can add a new wallet to your account by filling out the form below."
        >
          <AddWalletForm userId={session.user.id} />
        </BasicModal>
        <BasicModal openLabel="New Income" modalTitle="" modalLabel="">
          <AddIncomeForm userId={session.user.id} />
        </BasicModal>
        <BasicModal openLabel="New Outcome" modalTitle="" modalLabel="">
          <AddOutcomeForm userId={session.user.id} />
        </BasicModal>
      </Sheet>
    </Stack>
  );
};
