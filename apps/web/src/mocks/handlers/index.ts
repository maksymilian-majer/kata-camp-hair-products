// MSW handlers for development mocking
// Comment out handlers for endpoints integrated with real backend
// Keep imports for reference and test setup

// Integrated endpoints (using real backend):
// import { authHandlers } from './auth';
// import { healthHandlers } from './health';

// Endpoints still being mocked:
import { questionnaireHandlers } from './questionnaire';

export const handlers = [
  // ...authHandlers,   // Integrated - uses real API
  // ...healthHandlers, // Integrated - uses real API
  ...questionnaireHandlers,
];
