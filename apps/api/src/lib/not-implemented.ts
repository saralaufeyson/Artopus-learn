import { ApiError } from './api-error.js';
export function notImplemented(feature: string): never {
  throw new ApiError(501, 'NOT_IMPLEMENTED', feature + ' is scaffolded and not implemented yet.');
}
