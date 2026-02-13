import { z } from 'zod';

export const UserRole = z.enum(['ADMIN', 'USER']);

// Add more shared schemas here
