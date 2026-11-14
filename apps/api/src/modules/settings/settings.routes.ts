import { Router } from 'express';
import { settingsController } from './settings.controller.js';
import { siteSettingsInputSchema } from './settings.validation.js';
import { validateBody } from '../../middleware/validate.js';
export const settingsPublicRouter = Router();
settingsPublicRouter.get('/', settingsController.getPublic);
export const settingsAdminRouter = Router();
settingsAdminRouter.get('/', settingsController.getAdmin);
settingsAdminRouter.put('/', validateBody(siteSettingsInputSchema), settingsController.update);
