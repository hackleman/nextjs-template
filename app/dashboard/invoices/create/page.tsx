import Form from '@/src/components/invoices/create-form';
import Breadcrumbs from '@/src/components/invoices/breadcrumbs';
import { fetchCustomers } from '@/src/api/data'

export default async function Page() {
    const customers = await fetchCustomers()

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label: 'Create Invoice',
                        href: '/dashboard/invoices/create',
                        active: true
                    }
                ]}
            />
            <Form customers={customers} />
        </main>
    )
}