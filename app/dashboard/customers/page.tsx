import { Suspense } from 'react';
import Pagination from '@/src/components/invoices/pagination';
import { fetchCustomersPages, fetchFilteredCustomers } from '@/src/api/data';
import { lusitana } from '@/src/components/styles/fonts';
import { CreateInvoice } from '@/src/components/invoices/buttons';
import Search from '@/src/components/search';
import { CustomersTableSkeleton } from '@/src/components/skeletons';
import Table from '@/src/components/customers/table';

export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    const totalPages = await fetchCustomersPages(query);

    return (
        <div className="w-full">
            <div className="w-full">
                <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
                    Customers
                </h1>
                <Search placeholder="Search customers..." />
                <Suspense key={query + currentPage} fallback={<CustomersTableSkeleton />}>
                    <Table query={query} currentPage={currentPage} />
                </Suspense>
            </div>
            <div className="mt-5 flex w-full justify-center">
                <Pagination totalPages={totalPages} />
            </div>
        </div>
    );
}