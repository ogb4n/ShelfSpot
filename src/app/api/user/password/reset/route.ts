import { prisma } from "@/app/utils/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  const { password, confirmPassword, userId } = await request.json();
  if (!password || !confirmPassword || password !== confirmPassword) {
    return new Response(JSON.stringify({ error: "Passwords do not match" }), {
      status: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
