
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';

// Mock data for display purposes
const mockOriginalBudgetData = {
  projectName: "The Grand Living Room Makeover",
  clientName: "Isabella Rossi",
  originalBudget: 22500,
};

const CounterProposalPage: React.FC = () => {
  const navigate = useNavigate();
  const [proposedChanges, setProposedChanges] = useState('');
  const [updatedPricing, setUpdatedPricing] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Placeholder for submission logic
    console.log({
      proposedChanges,
      updatedPricing: updatedPricing ? parseFloat(updatedPricing) : null,
    });
    alert("Counter-proposal submitted (mock action)!");
    setIsLoading(false);
    // navigate(-1); // Optionally go back or to a confirmation page
  };

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 px-0 sm:px-4">
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link className="hover:text-[var(--color-primary)]" to="/projects">Projects</Link>
            <span className="mx-2 text-slate-400">/</span>
            <Link className="hover:text-[var(--color-primary)]" to="/projects/the-grand-living-room-makeover">The Grand Living Room Makeover</Link>
            <span className="mx-2 text-slate-400">/</span>
            <span className="text-slate-700">Counter-Proposal</span>
          </nav>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Submit Counter-Proposal</h1>
            <p className="mt-3 text-slate-600 text-base">
              Review the original budget and propose your adjustments. Clearly describe any changes to product selections, quantities, or other project aspects.
            </p>
          </div>

          <div className="mb-8 border-b border-slate-200 pb-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Original Budget Overview</h2>
            <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
              <div>
                <p className="text-xs font-medium text-slate-500">Project Name</p>
                <p className="text-sm font-semibold text-slate-700">{mockOriginalBudgetData.projectName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Client Name</p>
                <p className="text-sm font-semibold text-slate-700">{mockOriginalBudgetData.clientName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Original Budget</p>
                <p className="text-sm font-semibold text-slate-700">${mockOriginalBudgetData.originalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Your Counter-Proposal</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="proposal-details">Proposed Changes *</label>
                <textarea
                  id="proposal-details"
                  name="proposal-details"
                  rows={6}
                  className="form-textarea block w-full rounded-lg border-slate-300 bg-slate-50 shadow-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] sm:text-sm placeholder-slate-400 p-3"
                  placeholder="Clearly describe your proposed changes, including alternative product selections, quantities, or other modifications. Justify your suggestions where necessary."
                  value={proposedChanges}
                  onChange={(e) => setProposedChanges(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="updated-pricing">Updated Pricing (if applicable)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    id="updated-pricing"
                    name="updated-pricing"
                    type="number"
                    className="!pl-7 !pr-12" // Adjusted for prefix/suffix
                    placeholder="0.00"
                    value={updatedPricing}
                    onChange={(e) => setUpdatedPricing(e.target.value)}
                    disabled={isLoading}
                    step="0.01"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">USD</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">Leave blank if the budget remains unchanged.</p>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading || !proposedChanges.trim()}
                  className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:outline-[var(--color-primary)]"
                >
                  <Icon iconName="send" className="mr-2 text-base" />
                  Submit Counter-Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterProposalPage;
