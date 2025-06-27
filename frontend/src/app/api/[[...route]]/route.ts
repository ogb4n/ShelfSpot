import { NextRequest, NextResponse } from "next/server";
import { routeRegistry } from "./registry";

export async function GET(
  req: NextRequest,
  context: { params: { route?: string[] } }
) {
  const params = await context.params;

  return handleRequest(req, "GET", params);
}

export async function POST(
  req: NextRequest,
  context: { params: { route?: string[] } }
) {
  const params = await context.params;

  return handleRequest(req, "POST", params);
}

export async function PUT(
  req: NextRequest,
  context: { params: { route?: string[] } }
) {
  const params = await context.params;

  return handleRequest(req, "PUT", params);
}

export async function DELETE(
  req: NextRequest,
  context: { params: { route?: string[] } }
) {
  const params = await context.params;

  return handleRequest(req, "DELETE", params);
}

export async function PATCH(
  req: NextRequest,
  context: { params: { route?: string[] } }
) {
  const params = await context.params;
  return handleRequest(req, "PATCH", params);
}

async function handleRequest(
  req: NextRequest,
  method: string,
  params: { route?: string[] }
) {
  try {
    const routeParams = params.route || [];
    const path = routeParams.join("/");

    const matched = routeRegistry.matchRoute(path);

    if (!matched) {
      return NextResponse.json({ error: "Route non trouvée" }, { status: 404 });
    }

    const { handler, params: matchedParams } = matched;

    if (!handler[method]) {
      return NextResponse.json(
        { error: "Méthode non autorisée" },
        { status: 405 }
      );
    }

    return await handler[method](req, matchedParams);
  } catch (error) {
    console.error("Erreur API:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
