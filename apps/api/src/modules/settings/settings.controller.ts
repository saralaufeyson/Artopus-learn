import type { RequestHandler } from 'express';
import { settingsService } from './settings.service.js';
export const settingsController = {
  getPublic: (async (_request, response) => { response.json({ data: await settingsService.getPublic() }); }) satisfies RequestHandler,
  routes: (async (_request, response) => { response.json({ data: await settingsService.routes() }); }) satisfies RequestHandler,
  getAdmin: (async (_request, response) => { response.json({ data: await settingsService.getAdmin() }); }) satisfies RequestHandler,
  update: (async (request, response) => { response.json({ data: await settingsService.update(request.body) }); }) satisfies RequestHandler,
};
