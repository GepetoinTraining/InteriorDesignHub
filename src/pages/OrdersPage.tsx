
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as orderService from '../services/orderService';
import { Order, OrderStatusType } from '../types/order';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import Badge from '../components/ui/Badge';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Same as orders.html
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrdersData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await orderService.fetchOrders();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrdersData();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders;
    return orders.filter(order =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const getStatusBadgeVariant = (status: OrderStatusType): 'success' | 'warning' | 'error' | 'primary' | 'secondary' => {
    switch (status) {
      case 'Completed':
      case 'Shipped':
        return 'success';
      case 'In Production':
        return 'warning';
      case 'Pending':
        return 'primary'; // Matching orders.html 'Pending' style
      case 'Cancelled':
        return 'error';
      default:
        return 'secondary';
    }
  };
  
  const getStatusTextClass = (status: OrderStatusType): string => {
    // These are inspired by orders.html inline styles but better handled via Badge variants now.
    // This function could be used for direct text coloring if needed, but Badge handles it.
    switch (status) {
        case 'Completed': return 'text-green-700';
        case 'In Production': return 'text-blue-700'; // orders.html had blue for in-production
        case 'Pending': return 'text-yellow-700'; // orders.html had yellow for pending
        default: return 'text-slate-700';
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)] mb-4"></div>
        <p className="text-slate-700 text-lg">Loading Orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
        <Icon iconName="error_outline" className="text-red-500 text-5xl mb-4" />
        <p className="text-slate-800 text-xl font-semibold mb-2">Failed to load orders</p>
        <p className="text-slate-600 text-sm mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight">Production Orders</h1>
          <p className="text-slate-500 text-sm sm:text-base">Track and manage all production orders.</p>
        </div>
        <Button 
          onClick={() => alert('New Order functionality coming soon!')} 
          className="!bg-[#c5d9eb] !text-slate-900 hover:!bg-[#b0c8e0] !shadow-sm" // Matching orders.html style
        >
          <Icon iconName="add_circle_outline" className="mr-2 text-base" />
          New Order
        </Button>
      </div>

      <div className="mb-5 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon iconName="search" className="text-slate-400" />
        </div>
        <Input
          type="text"
          placeholder="Search by Order ID, Client, Product, or Status..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="!pl-10 w-full"
          aria-label="Search orders"
        />
      </div>

      <div className="flex-1 overflow-x-auto custom-scrollbar">
        {paginatedOrders.length === 0 && !isLoading ? (
          <div className="text-center py-10 text-slate-500">
            <Icon iconName="local_shipping" className="text-4xl mb-2" />
            <p>No orders found{searchTerm && ' matching your search'}.</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider hidden sm:table-cell">Client</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Products</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider hidden md:table-cell">Qty</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-800">{order.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 hidden sm:table-cell">{order.clientName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 truncate max-w-[200px]" title={order.items.map(item => item.productName).join(', ')}>
                      {order.items.map(item => item.productName).join(', ')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 text-right hidden md:table-cell">{order.totalQuantity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Badge variant={getStatusBadgeVariant(order.status)} size="small">
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="outlined" 
                        onClick={() => alert(`View order ${order.id}`)}
                        className="!h-7 !px-2 !text-xs !text-[#c5d9eb] !border-[#c5d9eb] hover:!bg-[#c5d9eb]/10 hover:!text-[#a0b9d6]" // Matching orders.html style
                      >
                        <Icon iconName="visibility" className="text-base mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center text-sm text-slate-600">
          <p>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders</p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="!p-2 !rounded-md !h-8 !w-8 disabled:!opacity-50"
            >
              <Icon iconName="chevron_left" className="text-lg" />
            </Button>
            {Array.from({length: Math.min(5, totalPages)}, (_, i) => { // Show max 5 page numbers
                let pageNum;
                if (totalPages <= 5 || currentPage <=3) {
                    pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                } else {
                    pageNum = currentPage - 2 + i;
                }
                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                    <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={currentPage === pageNum ? 'primary' : 'secondary'}
                        className={`!font-medium !text-xs !h-8 !w-8 !p-0 !rounded-md ${currentPage === pageNum ? '!bg-[#c5d9eb] !text-slate-900' : 'hover:!bg-slate-100'}`}
                    >
                        {pageNum}
                    </Button>
                );
            })}
            {totalPages > 5 && currentPage < totalPages - 2 && <span className="px-1">...</span>}
             {totalPages > 5 && currentPage < totalPages - 2 && (
                <Button
                    onClick={() => handlePageChange(totalPages)}
                    variant='secondary'
                    className={`!font-medium !text-xs !h-8 !w-8 !p-0 !rounded-md hover:!bg-slate-100`}
                >
                    {totalPages}
                </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="!p-2 !rounded-md !h-8 !w-8 disabled:!opacity-50"
            >
              <Icon iconName="chevron_right" className="text-lg" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
