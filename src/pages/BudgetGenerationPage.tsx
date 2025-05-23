
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';

type PresentationStyle = 'simple' | 'detailed';
interface ContentOptions {
  includeProductInfo: boolean;
  includePricingDetails: boolean;
  includeAiImages: boolean;
}

const BudgetGenerationPage: React.FC = () => {
  const navigate = useNavigate();
  const [presentationStyle, setPresentationStyle] = useState<PresentationStyle>('simple');
  const [contentOptions, setContentOptions] = useState<ContentOptions>({
    includeProductInfo: true,
    includePricingDetails: true,
    includeAiImages: false,
  });

  const handleStyleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPresentationStyle(event.target.value as PresentationStyle);
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setContentOptions(prev => ({ ...prev, [name]: checked }));
  };

  const handleGeneratePdf = () => {
    console.log("Generate PDF Clicked");
    console.log("Presentation Style:", presentationStyle);
    console.log("Content Options:", contentOptions);
    // Placeholder: In a real app, this would trigger PDF generation logic
    alert(`Generating PDF with style: ${presentationStyle} and options: ${JSON.stringify(contentOptions)}`);
  };

  const handleCancel = () => {
    console.log("Cancel Clicked");
    navigate(-1); // Go back to the previous page
  };
  
  const handleFullPreview = () => {
    console.log("Full Preview Clicked");
    alert("Full preview functionality will be implemented later.");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl border border-slate-200">
        <div className="mb-8">
          <h1 className="text-slate-900 text-2xl sm:text-3xl font-bold leading-tight tracking-tight">Generate Budget PDF</h1>
          <p className="text-slate-500 text-sm sm:text-base font-normal leading-relaxed mt-2">
            Customize the presentation style and preview the PDF before sending it to the client.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-slate-800 text-xl font-semibold leading-tight tracking-tight mb-4">Presentation Style</h3>
            <div className="flex flex-wrap gap-4">
              <label className={`flex items-center justify-center rounded-lg border px-6 py-3 text-slate-700 
                                relative cursor-pointer transition-all duration-150 ease-in-out
                                ${presentationStyle === 'simple' ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'border-slate-300 hover:border-slate-400'}`}>
                <input
                  type="radio"
                  name="presentation_style"
                  value="simple"
                  checked={presentationStyle === 'simple'}
                  onChange={handleStyleChange}
                  className="sr-only"
                  aria-labelledby="style-simple-label"
                />
                <Icon iconName="article" className="mr-2 text-lg" />
                <span id="style-simple-label">Simple</span>
              </label>
              <label className={`flex items-center justify-center rounded-lg border px-6 py-3 text-slate-700 
                                relative cursor-pointer transition-all duration-150 ease-in-out
                                ${presentationStyle === 'detailed' ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'border-slate-300 hover:border-slate-400'}`}>
                <input
                  type="radio"
                  name="presentation_style"
                  value="detailed"
                  checked={presentationStyle === 'detailed'}
                  onChange={handleStyleChange}
                  className="sr-only"
                  aria-labelledby="style-detailed-label"
                />
                <Icon iconName="view_list" className="mr-2 text-lg" />
                <span id="style-detailed-label">Detailed</span>
              </label>
            </div>
          </section>

          <section>
            <h3 className="text-slate-800 text-xl font-semibold leading-tight tracking-tight mb-4">Content Options</h3>
            <div className="space-y-3">
              {(Object.keys(contentOptions) as Array<keyof ContentOptions>).map((optionKey) => {
                const labelText = optionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return (
                  <label key={optionKey} className="flex items-center gap-x-3 p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      name={optionKey}
                      checked={contentOptions[optionKey]}
                      onChange={handleOptionChange}
                      className="h-5 w-5 rounded border-slate-300 border-2 bg-transparent text-[var(--color-primary)] checked:bg-[var(--color-primary)] checked:border-[var(--color-primary)] checked:bg-[image:var(--checkbox-tick-svg)] focus:ring-2 focus:ring-[var(--color-primary-light)] focus:ring-offset-0 focus:border-[var(--color-primary)] focus:outline-none"
                      aria-labelledby={`option-${optionKey}-label`}
                    />
                    <p id={`option-${optionKey}-label`} className="text-slate-700 text-sm font-medium leading-normal">{labelText}</p>
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-slate-800 text-xl font-semibold leading-tight tracking-tight mb-4">Preview</h3>
            <div className="@container">
              <div className="flex flex-col items-stretch justify-start rounded-lg border border-slate-200 overflow-hidden @xl:flex-row @xl:items-start">
                <div 
                  className="w-full bg-center bg-no-repeat aspect-[16/10] bg-cover bg-slate-100" 
                  style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuD6poTfbfteewwaIVGaV0Mf_69bQM9h7UZlSJV8KnVPU_roboLSiigNl_qcGvgDoIGMSesOSyrk8wl1XLvGJ1VlZzm0NOQfGKihlsXHL6OgE7z4mL0wzCbNHMxbRyIFrcRV4bby2p5vIwI-KIfdc6M4LjvMbdhy3N14gXcY15Gr27auztqGLTO8ri51kSiGlMgBjF0cak5RlokeqIKzQlEObmCwuT_oWCTg9ImAc4os5Gs1ZkP--6iYODuUanT6hlp0HL7rRBBTsQUW")` }}
                  role="img"
                  aria-label="Budget PDF Preview"
                ></div>
                <div className="flex w-full min-w-72 grow flex-col items-start justify-center gap-2 p-6 @xl:px-6 @xl:py-4">
                  <p className="text-slate-800 text-lg font-semibold leading-tight">Budget Preview</p>
                  <p className="text-slate-500 text-sm font-normal leading-relaxed">
                    View a preview of the generated PDF to ensure it meets your requirements. The preview will update based on your selections.
                  </p>
                  <Button 
                    variant="outlined" 
                    onClick={handleFullPreview} 
                    className="mt-3 text-sm"
                  >
                    <Icon iconName="visibility" className="mr-2 text-lg"/>
                    Full Preview
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-slate-200 mt-8">
            <Button variant="secondary" onClick={handleCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGeneratePdf} className="w-full sm:w-auto">
              <Icon iconName="picture_as_pdf" className="mr-2 text-lg" />
              Generate PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetGenerationPage;
