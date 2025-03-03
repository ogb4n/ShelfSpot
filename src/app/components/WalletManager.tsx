"use client";
import { useEffect, useState } from "react";
import { Stack } from "@mui/joy";
import { useSession } from "next-auth/react";
import { AddWalletForm } from "./forms/AddWalletForm";
import { BasicModal } from "./shared/BasicModal";
import { BorderColorIcon, FolderOpenIcon } from "../utils/icons";
import Table from "@mui/joy/Table";
import Sheet from "@mui/joy/Sheet";
import { WalletTransactions } from "./WalletTransactions"; // added import

interface Wallet {
  id: string;
  name: string;
  balance: number;
}

export const WalletManager = () => {
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    // Vérifiez que session.user existe et possède un id
    if (session?.user?.id) {
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

  // Vous pouvez gérer le cas où la session n'est pas encore chargée
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
                      p
                    </BasicModal>
                    <BasicModal
                      openLabel=""
                      icon={<FolderOpenIcon sx={{ width: 16 }} />}
                      modalTitle="wallet.name"
                      modalLabel="Wallet informations"
                    >
                      {/* Replace placeholder with wallet transactions table */}
                      <WalletTransactions walletId={wallet.id} />
                    </BasicModal>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Sheet>
      <BasicModal
        openLabel="Add wallet"
        modalTitle="Add a new wallet"
        modalLabel="You can add a new wallet to your account by filling out the form below."
      >
        <AddWalletForm userId={session.user.id} />
      </BasicModal>
    </Stack>
  );
};
