

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import * as geminiService from '../services/geminiService'; // Import the new service

// Mock data types - these would ideally come from a shared types file
interface ProductItem {
  id: string;
  name: string;
  configuration: string;
  quantity: number;
  price: number;
  imageUrl?: string; // Optional, for table display if needed
}

interface BudgetSummary {
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
}

const BudgetAndPreviewPage: React.FC = () => {
  const [clientSpacePhoto, setClientSpacePhoto] = useState<string | null>("https://lh3.googleusercontent.com/aida-public/AB6AXuA_-Hfv-CuKrwow6CjADb2Rgb_SphWEQcqSIdvFNY3YDr4g2k44Cv9hL_g2bKxMhxq3ENQF51AaRq4yZ8tmkIrudw7dYE79VACJa3SQfSRrJnx9lU8oORhc5kV114rMewA5g6eQbxJMaOoIcQXGHGAz0ux8QcM_0ZTC72BfReVMKDNf27jHnokclFYVmObS-KnVSfEdQ1wqYStz9HcNNcq_MQVJE5ecmoYXiiycXtLVhqohPXYU-UcGWp0JCBGWlNUTWKij3zqlW8dH");
  const [aiPreviewImage, setAiPreviewImage] = useState<string | null>("https://lh3.googleusercontent.com/aida-public/AB6AXuBnbpbsGyofWkJCFbPXi8n6VNafPrYGEPLHPEPqhNVKiGxp7gEfQJmMq6YwInMByRaSMg5ma7IOw-DhNawyMvTO9SwxgwLA-6DULEDfwVWZQ_6eU9PzeqTcengzCC_VZgA8vHh5UYfzMOOgB8KkPz9_YMWud6T6Lvm6AyFVybfXhnZvTkwKN-Y_Nha9AK3GJM2omWWRzc1_oyUygOtfbZTib5bh2z_gYNjoHuOCOCwMJhthgy7Ngb6mxcLSZmUwscJhz6y0j7SQ8UX");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const [selectedProducts, setSelectedProducts] = useState<ProductItem[]>([
    { id: '1', name: 'Modern Sofa', configuration: 'Leather, Beige', quantity: 1, price: 1500 },
    { id: '2', name: 'Coffee Table', configuration: 'Glass Top, Metal Legs', quantity: 1, price: 300 },
    { id: '3', name: 'Area Rug', configuration: 'Geometric Pattern, 8x10', quantity: 1, price: 200 },
  ]);

  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    subtotal: 2000,
    discount: 100,
    taxes: 150,
    total: 2050,
  });

  const handleUploadClientSpacePhoto = () => {
    console.log("Upload Client Space Photo clicked");
    // Placeholder: File upload logic will be added later
    alert("File upload functionality will be implemented later. For now, AI preview will use a generic room description.");
    // In a real scenario, you'd get a file, convert to base64 if needed for certain models, or upload and get a URL.
    // For Imagen 3, we only need a text prompt, so the client photo is for context/reference for the user/designer, not direct API input.
  };

  const handleGenerateAiPreview = async () => {
    setIsGeneratingPreview(true);
    setPreviewError(null);
    // Comment: Set placeholder image while generating
    setAiPreviewImage("https://via.placeholder.com/640x360/e0f2fe/0891b2?text=Generating+Preview..."); 

    const productNames = selectedProducts.map(p => p.name).join(', ');
    const prompt = `A photorealistic interior design image of a modern living room. The room features these items: ${productNames}. The style is bright, airy, and contemporary. Show a window with natural light.`;
    
    try {
      // Comment: Call the geminiService to generate the image
      const generatedImageUrl = await geminiService.generatePreviewImage(prompt);
      if (generatedImageUrl) {
        setAiPreviewImage(generatedImageUrl);
      } else {
        setPreviewError("Failed to generate preview: No image data returned.");
        // Comment: Set error placeholder image
        setAiPreviewImage("https://via.placeholder.com/640x360/fee2e2/b91c1c?text=Preview+Error"); 
      }
    } catch (error) {
      console.error("Error generating AI preview:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during preview generation.";
      setPreviewError(errorMessage);
      // Comment: Set error placeholder image
      setAiPreviewImage("https://via.placeholder.com/640x360/fee2e2/b91c1c?text=Preview+Error"); 
    } finally {
      setIsGeneratingPreview(false);
    }
  };
  
  const handleAddProduct = () => {
    console.log("Add Product clicked");
    alert("Add product functionality will be implemented later.");
  };

  const handleEditProduct = (productId: string) => {
    console.log("Edit product clicked:", productId);
    alert(`Edit product ${productId} functionality will be implemented later.`);
  };

  const handleDeleteProduct = (productId: string) => {
    console.log("Delete product clicked:", productId);
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    // TODO: Recalculate budget summary
    // For now, just an alert
    alert(`Product ${productId} removed. Budget summary would need recalculation.`);
  };


  return (
    <div className="flex flex-wrap gap-x-6 gap-y-8 p-4 md:p-6 @container/main">
      {/* Main Content Area */}
      <div className="flex flex-col gap-6 @[960px]/main:flex-1 @[960px]/main:max-w-none w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link to="/leads" className="text-slate-500 hover:text-slate-700 font-medium">Leads</Link>
            <Icon iconName="chevron_right" className="text-slate-400 text-base" />
            <span className="text-slate-800 font-medium">Lead Details</span>
          </div>
          <Button onClick={handleUploadClientSpacePhoto} variant="secondary" className="h-10 px-4 text-sm">
            <Icon iconName="upload_file" className="text-base mr-2" />
            Upload Client Space Photo
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-slate-900 tracking-tight text-2xl md:text-3xl font-bold leading-tight">Finalize Budget & Preview</h1>
          <p className="text-slate-600 text-sm font-normal leading-normal">
            Review and adjust the budget details and generate AI-based previews of products in the client's space.
          </p>
        </div>

        {previewError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <strong className="font-bold">Preview Error: </strong>
            <span className="block sm:inline">{previewError}</span>
          </div>
        )}

        <div className="grid gap-6 @[640px]/main:grid-cols-2">
          <section className="flex flex-col gap-4">
            <h2 className="text-slate-900 text-xl font-semibold tracking-tight">Client Space Photo</h2>
            <div 
                className="w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl border border-slate-200" 
                style={{ backgroundImage: `url("${clientSpacePhoto || 'https://via.placeholder.com/640x360/e2e8f0/94a3b8?text=Client+Space+Photo'}")` }}
                role="img"
                aria-label="Client's space photo"
            ></div>
          </section>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 text-xl font-semibold tracking-tight">AI Preview</h2>
              <Button 
                onClick={handleGenerateAiPreview} 
                variant="primary" 
                className="h-8 px-3 text-xs"
                isLoading={isGeneratingPreview}
                disabled={isGeneratingPreview}
              >
                <Icon iconName={isGeneratingPreview ? "" : "auto_awesome"} className={`text-sm ${isGeneratingPreview ? '' : 'mr-1.5'}`} />
                {isGeneratingPreview ? "Generating..." : "Generate Preview"}
              </Button>
            </div>
             <div 
                className="w-full bg-center bg-no-repeat bg-cover aspect-video rounded-xl border border-slate-200 flex items-center justify-center" 
                style={{ backgroundImage: aiPreviewImage && !isGeneratingPreview ? `url("${aiPreviewImage}")` : 'none', backgroundColor: isGeneratingPreview ? '#e0f2fe' : '#f8fafc' }}
                role="img"
                aria-label="AI generated preview"
            >
                {isGeneratingPreview && (
                     <div className="text-center text-sky-700">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600 mx-auto mb-2"></div>
                        <p className="text-xs">Generating preview...</p>
                    </div>
                )}
                {!aiPreviewImage && !isGeneratingPreview && (
                    <span className="text-slate-500 text-sm">AI Preview will appear here</span>
                )}


            </div>
          </section>
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-900 text-xl font-semibold tracking-tight">Product Selection</h2>
            <Button onClick={handleAddProduct} variant="secondary" className="h-8 px-3 text-xs">
              <Icon iconName="add" className="text-sm mr-1.5" />
              Add Product
            </Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white custom-scrollbar">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-600 w-2/5 text-xs font-medium uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-slate-600 w-2/5 text-xs font-medium uppercase tracking-wider">Configuration</th>
                  <th className="px-4 py-3 text-right text-slate-600 w-1/12 text-xs font-medium uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-slate-600 w-1/6 text-xs font-medium uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-center text-slate-600 w-auto text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedProducts.map(product => (
                  <tr key={product.id}>
                    <td className="h-[72px] px-4 py-3 text-slate-800 text-sm font-normal">{product.name}</td>
                    <td className="h-[72px] px-4 py-3 text-slate-600 text-sm font-normal">{product.configuration}</td>
                    <td className="h-[72px] px-4 py-3 text-slate-600 text-sm font-normal text-right">{product.quantity}</td>
                    <td className="h-[72px] px-4 py-3 text-slate-600 text-sm font-normal text-right">${product.price.toFixed(2)}</td>
                    <td className="h-[72px] px-4 py-3 text-slate-600 text-sm font-normal text-center">
                      <button onClick={() => handleEditProduct(product.id)} className="p-1 text-slate-500 hover:text-slate-700" aria-label={`Edit ${product.name}`}>
                        <Icon iconName="edit" className="text-base" />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-1 text-slate-500 hover:text-red-600" aria-label={`Delete ${product.name}`}>
                        <Icon iconName="delete" className="text-base" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
          <Button onClick={() => alert("Adjust Selection clicked")} variant="secondary" className="h-10 px-4 text-sm">
            <Icon iconName="tune" className="text-base mr-2" />
            Adjust Selection
          </Button>
          <Button onClick={() => alert("Present Budget clicked")} variant="primary" className="h-10 px-4 text-sm">
            <Icon iconName="payments" className="text-base mr-2" />
            Present Budget
          </Button>
        </div>
      </div>

      {/* Budget Summary Sidebar */}
      <aside className="flex flex-col gap-6 @[960px]/main:w-[360px] w-full bg-white p-6 rounded-xl shadow-lg border border-slate-200 self-start">
        <h2 className="text-slate-900 text-xl font-semibold tracking-tight">Budget Summary</h2>
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-600 text-sm">Subtotal</p>
            <p className="text-slate-800 text-sm font-medium">${budgetSummary.subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-slate-600 text-sm">Discount</p>
            <p className="text-red-600 text-sm font-medium">-${budgetSummary.discount.toFixed(2)}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-slate-600 text-sm">Taxes (Est.)</p>
            <p className="text-slate-800 text-sm font-medium">${budgetSummary.taxes.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-slate-200 pt-4">
          <p className="text-slate-800 text-base font-bold">Total</p>
          <p className="text-slate-900 text-lg font-bold">${budgetSummary.total.toFixed(2)}</p>
        </div>
        <Button onClick={() => alert("Finalize & Send Quote clicked")} variant="primary" fullWidth className="h-10 text-sm">
          <Icon iconName="receipt_long" className="text-base mr-2" />
          Finalize & Send Quote
        </Button>
      </aside>
    </div>
  );
};

export default BudgetAndPreviewPage;
