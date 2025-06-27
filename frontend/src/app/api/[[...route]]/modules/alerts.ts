import { GET , POST, CHECK_ALERTS, DELETE_ALERT, PATCH } from '../controllers/alerts';
import { ApiModule } from '../types';

export const alertsModule: ApiModule = {
  routes: [
    {
      path: 'alerts',
      handlers: {
        GET,
        POST,
      },
    },
    {
      path: 'alerts/:id',
      handlers: {
        PATCH,
        DELETE: DELETE_ALERT,
      },
    },
    {
      path: 'alerts/check',
      handlers: {
        POST: CHECK_ALERTS,
      },
    },
  ],
};
