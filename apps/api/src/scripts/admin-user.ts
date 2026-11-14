import { z } from 'zod';
import { AdminUser } from '../modules/auth/admin-user.model.js';
import { loadEnv } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
const input = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  name: z.string().trim().min(1).max(120),
  role: z.enum(['admin', 'editor']),
  status: z.enum(['active', 'disabled']),
});
async function main() {
  const [email, name, role = 'admin', status = 'active'] = process.argv.slice(2);
  const values = input.parse({ email, name, role, status });
  await connectDatabase(loadEnv().MONGODB_URI);
  try {
    await AdminUser.updateOne({ email: values.email }, { $set: values }, { upsert: true, runValidators: true });
    console.info('Administrator access updated. Sign in with the code sent to the approved email.');
  } finally { await disconnectDatabase(); }
}
main().catch(() => { console.error('Unable to update administrator. Usage: npm run admin:user -- email "Display name" [admin|editor] [active|disabled]'); process.exitCode = 1; });
