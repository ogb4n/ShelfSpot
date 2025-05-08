"use server";

import { getServerSession } from "next-auth";

const Settings = async () => {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <main className="flex min-h-screen items-center justify-center p-24">
      <div>
        <h1 className="text-4xl font-bold mb-4">Settings Page</h1>

      </div>
    </main>
  );
};

export default Settings;
