import { NextRequest, NextResponse } from "next/server";

export type ApiHandler = (
  req: NextRequest,
  params: Record<string, string>
) => Promise<NextResponse>;

export type RouteHandlers = Record<string, ApiHandler>;

export type RouteDefinition = {
  path: string;
  handlers: RouteHandlers;
};

export type ApiModule = {
  routes: RouteDefinition[];
};
