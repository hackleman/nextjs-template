import { seedCustomers, seedRevenue, seedUsers, tableExists } from "@/src/api/seed";
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    if ((await tableExists('customers'))) {
      return Response.json({ message: 'Tables exist, Database has already been seeded' }, { status: 500 });
    }

    const result = await sql.begin(() => [
      seedUsers(),
      seedCustomers(),
      seedRevenue()
    ]);

    return Response.json({ message: `Database seeded successfully: ${result.length}` });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
