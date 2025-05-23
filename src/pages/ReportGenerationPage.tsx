
import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import Input from '../components/ui/Input';

const ReportGenerationPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('');
  const [salesperson, setSalesperson] = useState('');
  const [client, setClient] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [dataFields, setDataFields] = useState('');

  const handleGenerateReport = () => {
    // Placeholder for report generation logic
    alert(
      `Generating report with options:\n
      Date Range: ${dateRange || 'Not set'}\n
      Salesperson: ${salesperson || 'All'}\n
      Client: ${client || 'All'}\n
      Format: ${outputFormat || 'Default'}\n
      Fields: ${dataFields || 'Default'}`
    );
  };

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 flex flex-1 justify-center py-8 bg-gray-50">
      <div className="layout-content-container flex flex-col w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-slate-900 text-3xl sm:text-4xl font-bold leading-tight tracking-tight">Generate Reports</h1>
          <p className="text-gray-600 text-base font-normal leading-relaxed mt-2">
            Customize and export reports in CSV or PDF format.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-8 border border-slate-200">
          <div>
            <h3 className="text-slate-900 text-xl font-semibold leading-tight tracking-tight mb-6">Filters</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-slate-800 mb-1.5">Date Range</label>
                <Input
                  id="dateRange"
                  type="text" // Could be replaced with a date range picker component
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  placeholder="Select Date Range"
                  className="!h-11"
                />
              </div>
              <div>
                <label htmlFor="salesperson" className="block text-sm font-medium text-slate-800 mb-1.5">Salesperson</label>
                <Input
                  id="salesperson"
                  type="text"
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                  placeholder="Select Salesperson"
                  className="!h-11"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="client" className="block text-sm font-medium text-slate-800 mb-1.5">Client</label>
                <select
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-gray-300 bg-white focus:border-[var(--color-primary)] h-11 bg-[image:var(--select-button-svg)] bg-no-repeat bg-[center_right_0.75rem] p-3 text-sm font-normal leading-normal transition-colors"
                >
                  <option value="">All Clients</option>
                  <option value="client1">Client Alpha</option>
                  <option value="client2">Client Beta</option>
                  <option value="client3">Client Gamma</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 text-xl font-semibold leading-tight tracking-tight mb-6">Report Options</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="outputFormat" className="block text-sm font-medium text-slate-800 mb-1.5">Output Format</label>
                <select
                  id="outputFormat"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-gray-300 bg-white focus:border-[var(--color-primary)] h-11 bg-[image:var(--select-button-svg)] bg-no-repeat bg-[center_right_0.75rem] p-3 text-sm font-normal leading-normal transition-colors"
                >
                  <option value="">Select Format</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
              <div>
                <label htmlFor="dataFields" className="block text-sm font-medium text-slate-800 mb-1.5">Data Fields</label>
                <select
                  id="dataFields"
                  value={dataFields}
                  onChange={(e) => setDataFields(e.target.value)}
                  className="form-select appearance-none block w-full rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[var(--color-primary)] border border-gray-300 bg-white focus:border-[var(--color-primary)] h-11 bg-[image:var(--select-button-svg)] bg-no-repeat bg-[center_right_0.75rem] p-3 text-sm font-normal leading-normal transition-colors"
                >
                  <option value="">Select Fields to Include</option>
                  <option value="contactName">Contact Name</option>
                  <option value="leadSource">Lead Source</option>
                  <option value="projectValue">Project Value</option>
                  <option value="status">Status</option>
                  <option value="all">All Standard Fields</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 mt-4 border-t border-slate-200">
            <Button
              onClick={handleGenerateReport}
              className="!h-11 !text-sm !font-semibold" // Matching styles from html
              variant="primary" // Ensure it uses theme color
            >
              <Icon iconName="settings_applications" className="mr-2 text-base" /> {/* Using settings_applications as an example */}
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerationPage;
