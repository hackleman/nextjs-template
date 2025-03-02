import postgres from 'postgres';
import { logger } from '@/logger'
import { tableExists, seedInvoices, countInvoices } from '@/src/api/seed';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    if (!(await tableExists('customers')) || !(await tableExists('invoices'))) {
        return Response.json({ message: 'Cannot seed Invoices, Table does not exist' });
    }

    const result = await sql.begin(() => [
      seedInvoices(),
      countInvoices()
    ]);

    if (result[0]) {
        logger.info(`${result[0]} items in INVOICES table`)
        return Response.json({ message: `${result[0]} items in INVOICES` });
    } else {
        throw new Error('Query failed')
    }

  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
