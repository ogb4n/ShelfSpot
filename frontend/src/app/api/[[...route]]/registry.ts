// app/api/[[...route]]/registry.ts - Registre central des routes

import { RouteHandlers, ApiModule } from "./types";
import { userModule } from "./modules/user";
import { itemsModule } from "./modules/items";
import { tagsModule } from "./modules/tags";
import { placesModule } from "./modules/places";
import { roomsModule } from "./modules/rooms";
import { adminModule } from "./modules/admin";
import { containersModule } from "./modules/containers";
import { alertsModule } from "./modules/alerts";

class RouteRegistry {
  private routes: Record<string, RouteHandlers> = {};

  constructor() {
    this.registerModule(userModule);
    this.registerModule(itemsModule);
    this.registerModule(tagsModule);
    this.registerModule(placesModule);
    this.registerModule(roomsModule);
    // Désactiver temporairement le module admin jusqu'à ce qu'il soit migré
    // this.registerModule(adminModule);
    this.registerModule(containersModule);
    this.registerModule(alertsModule);
  }

  registerModule(module: ApiModule) {
    module.routes.forEach((route) => {
      this.routes[route.path] = route.handlers;
    });
  }

  matchRoute(
    path: string
  ): { handler: RouteHandlers; params: Record<string, string> } | null {
    // D'abord, essayez de trouver une correspondance exacte
    if (this.routes[path]) {
      return { handler: this.routes[path], params: {} };
    }

    // Sinon, cherchez les routes avec paramètres
    const pathSegments = path.split("/").filter(s => s.length > 0);

    for (const route in this.routes) {
      const routeSegments = route.split("/").filter(s => s.length > 0);
      if (routeSegments.length !== pathSegments.length) continue;

      const params: Record<string, string> = {};
      let isMatch = true;

      for (let i = 0; i < routeSegments.length; i++) {
        if (routeSegments[i].startsWith(":")) {
          // C'est un paramètre
          const paramName = routeSegments[i].substring(1);
          params[paramName] = pathSegments[i];
        } else if (routeSegments[i] !== pathSegments[i]) {
          // Non correspondant
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return { handler: this.routes[route], params };
      }
    }

    return null;
  }
}

export const routeRegistry = new RouteRegistry();
