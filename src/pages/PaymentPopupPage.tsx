
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Or useNavigate if needed for actions
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

type PaymentMethod = 'credit-card' | 'pix' | 'bank-transfer';

interface OrderSummary {
  total: number;
  discount: number;
  amountDue: number;
}

const mockOrderSummary: OrderSummary = {
  total: 1250.00,
  discount: 125.00,
  amountDue: 1125.00,
};

const PaymentPopupPage: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit-card');
  const [isLoading, setIsLoading] = useState(false);
  // Form states for credit card
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Payment submitted with method:", selectedMethod);
    // Placeholder for actual payment processing
    setTimeout(() => {
      alert(`Payment processing for ${selectedMethod} (Amount: $${mockOrderSummary.amountDue.toFixed(2)}) - This is a mock action.`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root">
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 bg-white px-6 md:px-10 py-4 shadow-sm">
          <Link to="/" className="flex items-center gap-3 text-gray-800">
            <div className="size-6 text-[var(--color-primary,#cedfed)]"> {/* Using var with fallback */}
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-gray-800 text-xl font-bold leading-tight tracking-[-0.015em]">DesignCo CRM</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link className="text-gray-600 hover:text-gray-900 text-sm font-medium leading-normal transition-colors" to="#">Dashboard</Link>
            {/* Add other nav links if necessary */}
          </nav>
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-600 hover:text-gray-900">
              <Icon iconName="menu" />
            </button>
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-gray-300" style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuASYK6l44hpieYde5h2mjVAk-wOz6csXhuGN3bN0_bdyafdGHRQFsfe1KNgu2UZU-SGAqEpX-M9x7-eIcsKgEHas8NAzIs06UUBAwjZ42XYsrlG1IdeVRw_SM6_jwCXVoxjKyeCkuMljJKsZoAUgIE-eXPkrjaIr8iuFF9gu4_iRHcccTrWqLdKF1mUFphYMt4KsXh9S9-9EdCNx5dbe2pnpZc8Sc0Pz11tsRDE4FmeWdU3wFqb-QWyvjIiiSsVvPMOOrUrMUIXzb2n")` }}></div>
          </div>
        </header>

        <main className="flex flex-1 justify-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Complete Your Payment</h2>
              <p className="mt-3 text-lg leading-8 text-gray-600">Securely finalize your transaction for our interior design services.</p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="bg-white shadow-xl rounded-xl p-6 md:p-8">
              <section className="mb-8" id="payment-summary">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-3">Order Summary</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">${mockOrderSummary.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({(mockOrderSummary.discount / mockOrderSummary.total * 100).toFixed(0)}%):</span>
                    <span className="font-medium">-${mockOrderSummary.discount.toFixed(2)}</span>
                  </div>
                  <hr className="my-2 border-gray-200" />
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Amount Due:</span>
                    <span>${mockOrderSummary.amountDue.toFixed(2)}</span>
                  </div>
                </div>
              </section>

              <section id="payment-method-selection">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b pb-3">Choose Payment Method</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {(['credit-card', 'pix', 'bank-transfer'] as PaymentMethod[]).map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all duration-300 ease-in-out
                                  ${selectedMethod === method ? 'border-[var(--color-primary,#cedfed)] bg-[var(--color-primary-light,#f0f6fc)] shadow-md' : 'border-gray-300 hover:border-[var(--color-primary,#cedfed)] hover:shadow-sm'}`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method}
                        checked={selectedMethod === method}
                        onChange={() => setSelectedMethod(method)}
                        className="h-5 w-5 border-gray-300 text-[var(--color-primary,#cedfed)] focus:ring-[var(--color-primary,#cedfed)] checked:bg-[image:var(--radio-dot-svg)]"
                      />
                      <Icon iconName={method === 'credit-card' ? 'credit_card' : method === 'pix' ? 'qr_code_2' : 'account_balance'} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {method === 'credit-card' ? 'Credit Card' : method === 'pix' ? 'Pix' : 'Bank Transfer'}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {selectedMethod === 'credit-card' && (
                <div className="mt-8 space-y-6" id="credit-card-form">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="card-number">Card Number</label>
                    <Input className="!bg-gray-50 focus:!border-[var(--color-primary,#cedfed)] focus:!ring-[var(--color-primary,#cedfed)]/50" id="card-number" placeholder="•••• •••• •••• ••••" type="text" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiry-date">Expiry Date</label>
                      <Input className="!bg-gray-50 focus:!border-[var(--color-primary,#cedfed)] focus:!ring-[var(--color-primary,#cedfed)]/50" id="expiry-date" placeholder="MM/YY" type="text" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvc">CVC</label>
                      <Input className="!bg-gray-50 focus:!border-[var(--color-primary,#cedfed)] focus:!ring-[var(--color-primary,#cedfed)]/50" id="cvc" placeholder="•••" type="text" value={cvc} onChange={e => setCvc(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cardholder-name">Cardholder Name</label>
                    <Input className="!bg-gray-50 focus:!border-[var(--color-primary,#cedfed)] focus:!ring-[var(--color-primary,#cedfed)]/50" id="cardholder-name" placeholder="Full Name as on Card" type="text" value={cardholderName} onChange={e => setCardholderName(e.target.value)} />
                  </div>
                </div>
              )}

              {selectedMethod === 'pix' && (
                <div className="mt-8 text-center" id="pix-details">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Pay with Pix</h4>
                  <p className="text-sm text-gray-600 mb-4">Scan the QR code below with your bank's app. Amount: <strong className="text-gray-800">${mockOrderSummary.amountDue.toFixed(2)}</strong></p>
                  <div className="flex justify-center">
                    <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRzVN0uCFM-ywuxJ-bVb85BMylTpAUP8ZsvTRhUaqNnaO6Bv808uU4GZxXEm4Wvgw9jFkF5m3VV_95Mub1AS4h0CWASymgPqZRIhLbLeRTqpaH0Kej5U9FEOWoFF5lrTOb5CXP43H8dugwc7nViTkiA49S8VDBZguuKIvIrGSVHMzw-ZnOeOSBPZqKPvi_yxvkUbux80ba3Rk3imFT6DsTeJow0FTgZglpkX1Qbd1o2mh2Vo4do73Id5-lhArDL4p7PGdzFZiNR9lT" 
                        alt="Pix QR Code"
                        className="w-56 h-56 bg-center bg-no-repeat bg-contain rounded-lg border border-gray-300 p-2"
                    />
                  </div>
                  <p className="mt-4 text-xs text-gray-500">Ensure the amount matches your order total before confirming.</p>
                </div>
              )}

              {selectedMethod === 'bank-transfer' && (
                <div className="mt-8" id="bank-transfer-details">
                  <h4 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Bank Transfer Instructions</h4>
                  <div className="space-y-4 text-sm">
                    {([
                      { label: "Bank Name:", value: "First National Bank" },
                      { label: "Account Number:", value: "1234567890" },
                      { label: "Branch Number:", value: "0001" },
                      { label: "Account Type:", value: "Checking" },
                      { label: "Reference:", value: "INV-2024-001" },
                    ]).map(detail => (
                      <div key={detail.label} className="grid grid-cols-3 gap-2">
                        <p className="text-gray-500 col-span-1">{detail.label}</p>
                        <p className="text-gray-800 font-medium col-span-2">{detail.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-gray-500">Please use your invoice number as the payment reference. Payments may take 1-2 business days to reflect.</p>
                </div>
              )}

              <div className="mt-10 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="!h-12 !text-base !font-semibold !bg-[var(--color-primary,#cedfed)] !text-gray-900 hover:!bg-[var(--color-primary-dark,#b3d1e7)] focus:!ring-[var(--color-primary,#cedfed)]"
                >
                  <Icon iconName="lock" className="mr-2" />
                  Pay ${mockOrderSummary.amountDue.toFixed(2)} Securely
                </Button>
              </div>
              <div className="mt-6 text-center" id="payment-message">
                {/* Payment success/error messages can be shown here */}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentPopupPage;
