import { NextResponse } from "next/server";
import { prisma } from "@/app/utils/prisma";

export async function GET(req: Request) {
  const params = new URLSearchParams(req.url.split("?")[1]);
  const walletId = params.get("walletId");
  if (!walletId) {
    return NextResponse.json(
      { error: "Missing required parameter 'walletId'" },
      { status: 400 }
    );
  }

  const parsedWalletId = parseInt(walletId);
  try {
    // Query incomes and outcomes separately
    const incomes = await prisma.income.findMany({
      where: { walletId: parsedWalletId },
    });

    const outcomes = await prisma.outcome.findMany({
      where: { walletId: parsedWalletId },
    });

    // Map each record to include a 'type'
    const incomeTransactions = incomes.map((income) => ({
      id: income.id,
      type: "income",
      amount: income.amount,
    }));

    const outcomeTransactions = outcomes.map((outcome) => ({
      id: outcome.id,
      type: "outcome",
      amount: outcome.amount,
    }));

    const transactions = [...incomeTransactions, ...outcomeTransactions];

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
