"use server";
import Box from "@mui/joy/Box";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { TagsManager } from "@/app/components/TagsManager";

const Settings = async () => {
  const session = await getServerSession();
  if (!session) redirect("/login");
  const user = session.user;
  console.log(user);

  return (
    <div>
      <main className="flex min-h-screen items-center justify-center p-24">
        <Box>
          <h1 className="text-4xl font-bold mb-4">Settings Page</h1>
          <TagsManager />
        </Box>
      </main>
    </div>
  );
};

export default Settings;
