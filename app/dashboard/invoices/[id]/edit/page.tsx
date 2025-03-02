import { notFound } from 'next/navigation';
import Form from '@/src/components/invoices/edit-form';
import Breadcrumbs from '@/src/components/invoices/breadcrumbs';
import { fetchCustomers, fetchInvoiceById } from '@/src/api/data';
 
export default async function Page(props: {
    params: Promise<{
      id: string
    }>,
    searchParams: Promise<{
      page: number
    }>;
  }) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const [customers, invoice] = await Promise.all([
    fetchCustomers(),
    fetchInvoiceById(params.id)
  ])

  if (!invoice) {
    notFound();
  }


  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${params.id}/edit`,
            active: true,
          },
        ]}
      />
      <Form invoice={invoice} customers={customers} currentPage={searchParams.page} />
    </main>
  );
}