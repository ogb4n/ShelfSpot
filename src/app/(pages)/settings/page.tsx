"use server";
import { Box } from "@mui/joy";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { TagsManager } from "@/app/components/TagsManager";
import { AccountManager } from "@/app/components/AccountManager";

const Settings = async () => {
  const session = await getServerSession();
  if (!session) redirect("/login");
  const user = session.user;
  console.log(user);

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <Box>
        <h1 className="text-4xl font-bold mb-4">Settings Page</h1>
        <TagsManager />
        <AccountManager />
      </Box>
    </main>
  );
};

export default Settings;
