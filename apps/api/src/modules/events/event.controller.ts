import { objectIdSchema } from '@artopus/shared';
import type { RequestHandler } from 'express';
import { contentQuerySchema, slugSchema } from '@artopus/shared';
import { eventsService } from './event.service.js';
export const eventsController = {
  list: (async (request, response) => { response.json({ data: await eventsService.list(contentQuerySchema.parse(request.query)) }); }) satisfies RequestHandler,
  getBySlug: (async (request, response) => { response.json({ data: await eventsService.getBySlug(slugSchema.parse(request.params.slug)) }); }) satisfies RequestHandler,
  adminList: (async (request, response) => { response.json({ data: await eventsService.admin.list(request.query) }); }) satisfies RequestHandler,
  getById: (async (request, response) => { response.json({ data: await eventsService.admin.get(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
  create: (async (request, response) => { response.status(201).json({ data: await eventsService.admin.create(request.body) }); }) satisfies RequestHandler,
  update: (async (request, response) => { response.json({ data: await eventsService.admin.update(objectIdSchema.parse(request.params.id), request.body) }); }) satisfies RequestHandler,
  archive: (async (request, response) => { response.json({ data: await eventsService.admin.archive(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
  preview: (async (request, response) => { response.json({ data: await eventsService.admin.get(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
};
