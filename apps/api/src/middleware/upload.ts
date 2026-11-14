import multer from 'multer';
import type { RequestHandler } from 'express';
import { ApiError } from '../lib/api-error.js';
const parse = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 1, fieldSize: 1000 },
  fileFilter: (_request, file, done) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype) ? done(null, true) : done(new ApiError(400, 'INVALID_IMAGE', 'Choose a JPEG, PNG, or WebP image.')),
}).single('image');
export const validateImageUpload: RequestHandler = (request, response, next) => {
  parse(request, response, error => { if (error) next(error instanceof ApiError ? error : new ApiError(400, 'INVALID_UPLOAD', 'Choose one image up to 10 MB and provide alternative text.')); else next(); });
};
