"use server";
import { WalletManager } from "@/app/components/WalletManager";

const Accounting = () => {
  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <WalletManager />
    </main>
  );
};

export default Accounting;
