import { Router } from 'express';
import { classesController } from './class.controller.js';
import { classInputSchema } from './class.validation.js';
import { validateBody } from '../../middleware/validate.js';
export const classesPublicRouter = Router();
classesPublicRouter.get('/', classesController.list);
classesPublicRouter.get('/:slug', classesController.getBySlug);
export const classesAdminRouter = Router();
classesAdminRouter.get('/', classesController.adminList);
// Ordering is saved through each offering's displayOrder field.
classesAdminRouter.get('/:id', classesController.getById);
classesAdminRouter.post('/', validateBody(classInputSchema), classesController.create);
classesAdminRouter.put('/:id', validateBody(classInputSchema), classesController.update);
classesAdminRouter.delete('/:id', classesController.archive);
