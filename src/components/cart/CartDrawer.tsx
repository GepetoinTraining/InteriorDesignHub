
import React, { useMemo } from 'react';
import Icon from '../ui/Icon';

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  isReferred: boolean; // Added to control button state
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  subtotal,
  onQuantityChange,
  onRemoveItem,
  isReferred,
}) => {
  const placeholderImage = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E0E7FF&color=4338CA&size=80`;

  const canConnectWithArchitect = useMemo(() => {
    // Example logic: enable if referred OR cart total is above a certain amount
    // This is a simplified version of the logic from cartslider.html
    return isReferred || subtotal > 500; 
  }, [isReferred, subtotal]);


  return (
    <>
      <div
        className={`overlay fixed inset-0 bg-black/30 z-40 ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      ></div>
      <aside
        className={`drawer fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="cart-drawer-title" className="text-xl font-semibold text-slate-800">Your Cart</h2>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 -mr-2"
            onClick={onClose}
            aria-label="Close cart"
          >
            <Icon iconName="close" className="text-2xl" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <Icon iconName="shopping_cart_checkout" className="text-4xl mb-3" />
              <p>Your cart is empty.</p>
              <button 
                onClick={onClose} 
                className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-start gap-4">
                <img
                  src={item.imageUrl || placeholderImage(item.name)}
                  alt={item.name}
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-20 border border-gray-100 object-cover"
                  loading="lazy"
                  onError={(e) => { if (e.currentTarget.src !== placeholderImage(item.name)) e.currentTarget.src = placeholderImage(item.name);}}
                />
                <div className="flex-grow">
                  <h3 className="text-slate-800 text-base font-medium leading-tight line-clamp-2">{item.name}</h3>
                  <p className="text-slate-500 text-sm">Unit Price: ${item.unitPrice.toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="text-slate-500 hover:text-slate-700 p-1 rounded-full border border-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Icon iconName="remove" className="text-sm" />
                    </button>
                    <span className="text-slate-700 text-sm font-medium w-8 text-center tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      className="text-slate-500 hover:text-slate-700 p-1 rounded-full border border-gray-300 hover:border-gray-400 transition-colors"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Icon iconName="add" className="text-sm" />
                    </button>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-800 text-base font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium mt-1 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-600 text-lg font-medium">Subtotal</p>
              <p className="text-slate-900 text-xl font-semibold">${subtotal.toFixed(2)}</p>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center rounded-lg h-12 px-6 bg-[#cedfed] text-slate-900 text-base font-semibold hover:bg-[#b8d7ea] transition-colors">
                Request a Quote
              </button>
              <button 
                className={`w-full flex items-center justify-center rounded-lg h-12 px-6 text-base font-semibold transition-colors
                            ${canConnectWithArchitect 
                              ? 'bg-slate-700 text-white hover:bg-slate-800' 
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                disabled={!canConnectWithArchitect}
                title={!canConnectWithArchitect ? "This option becomes available for referred users or larger orders." : ""}
              >
                Connect with a Local Architect Professional
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
