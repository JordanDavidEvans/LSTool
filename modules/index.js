// List of available analysis modules for the QA Explorer.
// Each module should export an `id`, `name`, and `run` function.
// New modules can be added here and they will automatically appear in the popup menu.
import * as crawler from './crawler.js';

export const modules = [crawler];
