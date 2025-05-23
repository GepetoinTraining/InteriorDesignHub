
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';

// Mock data interfaces
interface QuoteProduct {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface AiVisualization {
  id: string;
  imageUrl: string;
  altText: string;
}

interface ProductionItem {
  id: string;
  productName: string;
  status: 'In Production' | 'Completed' | 'Shipped' | 'Pending';
  estimatedCompletion: string;
}

interface MockQuoteDetails {
  quoteNumber: string;
  dateIssued: string;
  validUntil: string;
  clientName: string;
  projectName: string;
  totalAmount: number;
  products: QuoteProduct[];
  aiVisualizations: AiVisualization[];
  productionTracking: ProductionItem[];
}

const mockQuoteData: MockQuoteDetails = {
  quoteNumber: 'QT-2024-0012',
  dateIssued: 'May 15, 2024',
  validUntil: 'June 15, 2024',
  clientName: 'Sophia Clark',
  projectName: 'Living Room Redesign',
  totalAmount: 12500,
  products: [
    { id: 'p1', name: 'Custom Sofa', description: 'Handcrafted sofa with premium fabric', quantity: 1, unitPrice: 4500, totalPrice: 4500 },
    { id: 'p2', name: 'Coffee Table', description: 'Modern glass and metal coffee table', quantity: 1, unitPrice: 1500, totalPrice: 1500 },
    { id: 'p3', name: 'Area Rug', description: 'Large wool area rug', quantity: 1, unitPrice: 2000, totalPrice: 2000 },
  ],
  aiVisualizations: [
    { id: 'vis1', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1pSXwcrQDy_23yMHO812pZs5vCpvLsySrh2cAnvPYkJFQRBroyRJCvA-tnwaaF3cSe4OIfkwS5HIJJxKCoKjB_MXjyIXAFsQNm46ZSDyRuDCCeRfXGvVk9tTL0Y8aoDbBcNTKMvGtQ4KIEjwwV-4wumBA9PUtu_5u74LGOv6YemlNvMHO41W7KxgP1l85bGQxIqCXM5dzQVJuaOTfwpvRPDWCJs5_-DokYVuOVFgxSmN_rnSevDNzTO9uLwLhfk57uWFuEzuPwlM7', altText: 'AI Visualization 1' },
    { id: 'vis2', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX95RNTWXParc6OAkTTBkeMdImnGC5vVV6Ofs2VkQJnaulOktr4sGvl9NFmBGVCk91d3yIJ4Ys4UkAv11ZoauClmLBE9Xr4f1h5zuBrTOddP7eUzlmKlKeITlz1iaiXXVuxXLdbjpBy-xHUgJPPRZDNhAA99MixXjR6V1NjODYyw4CBiDqkY5XSWolmLLUYWnRxvlrwAn25n1-ihC8jfNYr07HY1JW9p1MYFmll9RyMLsm0eogjsabOjL3wPALXljOcZwh06aSDvjC', altText: 'AI Visualization 2' },
    { id: 'vis3', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJJQkK9lfBwEG0-u0dh_VpvHPKwb8B_AT3jr-NzIdjprEiDVtLDJ7QPnfZoYakwYwkPiX8ITrMH1hpGEmKq3wYoWhZZkGhU74LHnXcNX8lfv1RKzASsplmd6ZdQHW0bK9Ves8hQiVhB0JKORczLUB6rqtJ8KfMoKkHGqrYWD7tPCg2UzqYqFUEEoC-5b3nC1Bn3YmCD03hiefNgNo4ardDvFGNiJmSVncwlFs1dyjJEyPl57vJGGP2ZWaCO42dNH8sC7ZDJP5aeCE6', altText: 'AI Visualization 3' },
  ],
  productionTracking: [
    { id: 'track1', productName: 'Custom Sofa', status: 'In Production', estimatedCompletion: 'June 10, 2024' },
    { id: 'track2', productName: 'Coffee Table', status: 'Completed', estimatedCompletion: 'May 20, 2024' },
    { id: 'track3', productName: 'Area Rug', status: 'Shipped', estimatedCompletion: 'May 25, 2024' },
  ],
};

const ClientQuoteDetailsPage: React.FC = () => {
  const { quoteId } = useParams<{ quoteId: string }>(); // quoteId not used yet, using mock data
  const [quoteDetails, setQuoteDetails] = useState<MockQuoteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setQuoteDetails(mockQuoteData);
      setIsLoading(false);
    }, 500);
  }, [quoteId]);

  const getStatusBadgeClass = (status: ProductionItem['status']) => {
    switch (status) {
      case 'In Production': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading quote details...</p></div>;
  }

  if (!quoteDetails) {
    return <div className="flex justify-center items-center h-screen"><p>Quote not found.</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link to="/clients" className="hover:text-slate-700">Clients</Link> {/* Assuming a /clients route exists */}
        <span>/</span>
        <Link to={`/clients/${quoteDetails.clientName.toLowerCase().replace(' ', '-')}`} className="hover:text-slate-700">{quoteDetails.clientName}</Link> {/* Dynamic client link (mock) */}
        <span>/</span>
        <span className="font-medium text-slate-700">Quote Details</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Quote Details</h1>
        <p className="mt-1 text-sm text-slate-600">Review the quote, request modifications, or submit a counter-proposal.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Quote Summary</h2>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <dl className="divide-y divide-slate-200">
              {Object.entries({
                "Quote Number": quoteDetails.quoteNumber,
                "Date Issued": quoteDetails.dateIssued,
                "Valid Until": quoteDetails.validUntil,
                "Client Name": quoteDetails.clientName,
                "Project Name": quoteDetails.projectName,
                "Total Amount": `$${quoteDetails.totalAmount.toLocaleString()}`,
              }).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 gap-1 px-6 py-4 sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">{key}</dt>
                  <dd className={`text-sm sm:col-span-2 ${key === "Total Amount" ? "font-semibold text-slate-900" : "text-slate-900"}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Product Details</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Unit Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {quoteDetails.products.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{product.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.description}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.quantity}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">${product.unitPrice.toLocaleString()}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">${product.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">AI-Generated Visualizations</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {quoteDetails.aiVisualizations.map((vis) => (
              <div key={vis.id} className="aspect-square w-full rounded-lg bg-cover bg-center shadow-sm border border-slate-200" style={{ backgroundImage: `url("${vis.imageUrl}")` }} role="img" aria-label={vis.altText}></div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => alert('Request Modifications clicked')}>
              Request Modifications
            </Button>
            <Button variant="primary" onClick={() => alert('Submit Counter-Proposal clicked')}>
              Submit Counter-Proposal
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Quote Approval and Payment</h2>
          <Button variant="primary" className="bg-green-600 hover:bg-green-700 text-base px-6 py-3" onClick={() => alert('Approve Quote clicked')}>
            Approve Quote and Proceed to Payment
          </Button>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Production Tracking</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm custom-scrollbar">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Estimated Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {quoteDetails.productionTracking.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">{item.productName}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{item.estimatedCompletion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Installation Scheduling</h2>
          <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-md border border-slate-200">
            Once all items are received, you can schedule the installation. We will notify you when all items are ready.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Communication</h2>
          <p className="text-sm text-slate-600 p-4 bg-slate-50 rounded-md border border-slate-200">
            For any questions or concerns, please contact us via email or phone. Our team is here to assist you throughout the process.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ClientQuoteDetailsPage;
