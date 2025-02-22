"use server";
import { Box } from "@mui/joy";
import { TagsManager } from "@/app/components/TagsManager";
import { AccountManager } from "@/app/components/AccountManager";
import { ChangePassword } from "@/app/components/ChangePassword";
import { AdminPanel } from "@/app/components/AdminPanel";
import { getServerSession } from "next-auth";

const Settings = async () => {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <Box>
        <h1 className="text-4xl font-bold mb-4">Settings Page</h1>
        <TagsManager />
        <AccountManager user={user} />
        <ChangePassword />
        <AdminPanel />
      </Box>
    </main>
  );
};

export default Settings;
