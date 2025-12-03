// Auth handlers are integrated with real backend - handlers are only used in tests
import { authHandlers } from './auth';
import { healthHandlers } from './health';

export const handlers = [...authHandlers, ...healthHandlers];
