import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { logger } from '@/logger'
import { User } from './definitions';
import { customers, revenue, users, invoices } from './placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function tableExists(tableName: string) {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = ${tableName}
      ) AS table_exists;
    `;
    return result[0].table_exists;
}
  
export async function seedUsers() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;
  
    const insertedUsers = await Promise.all(
      users.map(async (user: User) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );
  
    logger.info(`${insertedUsers.length} users have been INSERTED INTO USERS`);
  
    return insertedUsers;
}
  
export async function seedCustomers() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;
  
    const insertedCustomers = await Promise.all(
      customers.map(
        (customer) => sql`
          INSERT INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );
    logger.info(`${insertedCustomers.length} customers have been INSERTED INTO CUSTOMERS`);
  
    return insertedCustomers;
}
  
export async function seedRevenue() {
    await sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;
  
    const insertedRevenue = await Promise.all(
      revenue.map(
        (rev) => sql`
          INSERT INTO revenue (month, revenue)
          VALUES (${rev.month}, ${rev.revenue})
          ON CONFLICT (month) DO NOTHING;
        `,
      ),
    );
    logger.info(`${insertedRevenue.length} revenues have been INSERTED INTO REVENUES`);
  
    return insertedRevenue;
}
  

export async function seedInvoices() {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      );
    `;
  
    const insertedInvoices = await Promise.all(
      invoices.map(
        (invoice) => sql`
          INSERT INTO invoices (customer_id, amount, status, date)
          VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `,
      ),
    );
    logger.info(`${insertedInvoices.length} invoices have been INSERTED INTO INVOICES`);
  
    return insertedInvoices;
}
  
export async function countInvoices() {
      const count = await Promise.all(
          [sql`SELECT COUNT(*) FROM invoices`,]
      );
  
      return count?.[0]?.[0]?.count ?? null;
}
  