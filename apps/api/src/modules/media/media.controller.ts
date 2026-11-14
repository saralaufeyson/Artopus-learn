import type { RequestHandler } from 'express';
import { objectIdSchema } from '@artopus/shared';
import { mediaService } from './media.service.js';
import type { MediaStorage } from '../../config/media-storage.js';
export const mediaController = {
  list: (async (request, response) => { response.json({ data: await mediaService.list(request.query) }); }) satisfies RequestHandler,
  upload: (async (request, response) => { response.status(201).json({ data: await mediaService.upload(request.file, request.body, request.app.locals.mediaStorage as MediaStorage | undefined) }); }) satisfies RequestHandler,
  update: (async (request, response) => { response.json({ data: await mediaService.update(objectIdSchema.parse(request.params.id), request.body) }); }) satisfies RequestHandler,
  remove: (async (request, response) => { await mediaService.remove(objectIdSchema.parse(request.params.id)); response.sendStatus(204); }) satisfies RequestHandler,
};
