import { objectIdSchema } from '@artopus/shared';
import type { RequestHandler } from 'express';
import { contentQuerySchema, slugSchema } from '@artopus/shared';
import { classesService } from './class.service.js';
export const classesController = {
  list: (async (request, response) => { response.json({ data: await classesService.list(contentQuerySchema.parse(request.query)) }); }) satisfies RequestHandler,
  getBySlug: (async (request, response) => { response.json({ data: await classesService.getBySlug(slugSchema.parse(request.params.slug)) }); }) satisfies RequestHandler,
  adminList: (async (request, response) => { response.json({ data: await classesService.admin.list(request.query) }); }) satisfies RequestHandler,
  getById: (async (request, response) => { response.json({ data: await classesService.admin.get(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
  create: (async (request, response) => { response.status(201).json({ data: await classesService.admin.create(request.body) }); }) satisfies RequestHandler,
  update: (async (request, response) => { response.json({ data: await classesService.admin.update(objectIdSchema.parse(request.params.id), request.body) }); }) satisfies RequestHandler,
  archive: (async (request, response) => { response.json({ data: await classesService.admin.archive(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
  preview: (async (request, response) => { response.json({ data: await classesService.admin.get(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
};
