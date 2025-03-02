'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';

import { InvoicesTableSchema } from "./definitions";
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const CreateInvoice = InvoicesTableSchema.omit({ id: true, date: true, name: true, email: true, image_url: true })
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function deleteInvoice(id: string, page: number) {
    try {
        await sql`
            DELETE FROM invoices
            WHERE id = ${id}
        `;
    } catch(error) {
        console.error(error);
    }

    revalidatePath(`/dashboard/invoices?page=${page}`);
    redirect(`/dashboard/invoices?page=${page}`);
}

export async function updateInvoice(page: number, id: string, _: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields.  Failed to Create Invoice.'
        }
    }
    const { customerId, amount, status } = validatedFields.data;
    const cents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
            UPDATE invoices
            SET customer_Id = ${customerId}, amount = ${cents}, status = ${status}, date = ${date}
            WHERE id = ${id}
        `;
    } catch (error) {
        return {
            message: `Database Error: Failed to Update Invoice.\n${error}`,
        };
    }
    revalidatePath(`/dashboard/invoices?page=${page}`);
    redirect(`/dashboard/invoices?page=${page}`);
}

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing fields.  Failed to Create Invoice.'
        }
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        return {
            message: `Database Error: Failed to Create Invoice.\n${error}`,
        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
}