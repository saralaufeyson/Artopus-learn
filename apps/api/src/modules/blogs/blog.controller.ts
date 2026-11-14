import { objectIdSchema } from '@artopus/shared';
import type { RequestHandler } from 'express';
import { contentQuerySchema, slugSchema } from '@artopus/shared';
import { blogsService } from './blog.service.js';
export const blogsController = {
  list: (async (request, response) => { response.json({ data: await blogsService.list(contentQuerySchema.parse(request.query)) }); }) satisfies RequestHandler,
  getBySlug: (async (request, response) => { response.json({ data: await blogsService.getBySlug(slugSchema.parse(request.params.slug)) }); }) satisfies RequestHandler,
  categories: (async (_request, response) => { response.json({ data: await blogsService.categories() }); }) satisfies RequestHandler,
  adminList: (async (request, response) => { response.json({ data: await blogsService.admin.list(request.query) }); }) satisfies RequestHandler,
  getById: (async (request, response) => { response.json({ data: await blogsService.admin.get(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
  create: (async (request, response) => { response.status(201).json({ data: await blogsService.admin.create(request.body) }); }) satisfies RequestHandler,
  update: (async (request, response) => { response.json({ data: await blogsService.admin.update(objectIdSchema.parse(request.params.id), request.body) }); }) satisfies RequestHandler,
  archive: (async (request, response) => { response.json({ data: await blogsService.admin.archive(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
  preview: (async (request, response) => { response.json({ data: await blogsService.admin.get(objectIdSchema.parse(request.params.id)) }); }) satisfies RequestHandler,
};
