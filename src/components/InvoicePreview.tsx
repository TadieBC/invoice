import React from 'react';
import { InvoiceData, TemplateType } from '../types';
import { formatCurrency, cn } from '../lib/utils';

interface InvoicePreviewProps {
  data: InvoiceData;
  template: TemplateType;
  primaryColor: string;
}

const getFontClass = (pairing?: string) => {
  switch (pairing) {
    case 'classic': return 'font-serif';
    case 'mono': return 'font-mono';
    case 'modern':
    default: return 'font-sans';
  }
};

const getTableClass = (style?: string, isDark?: boolean) => {
  switch (style) {
    case 'bordered': return isDark ? 'border border-slate-700 divide-y divide-slate-700' : 'border border-slate-200 divide-y divide-slate-200';
    case 'striped': return isDark ? '[&_tbody_tr:nth-child(even)]:bg-slate-800/50' : '[&_tbody_tr:nth-child(even)]:bg-slate-50';
    case 'minimal':
    default: return isDark ? 'divide-y divide-slate-800/50' : 'divide-y divide-slate-100';
  }
};

const getLogoClass = (placement?: string) => {
  switch (placement) {
    case 'center': return 'mx-auto';
    case 'right': return 'ml-auto';
    case 'left':
    default: return 'mr-auto';
  }
};

const getHeaderLayoutClass = (layout?: string) => {
  switch (layout) {
    case 'split': return 'flex justify-between items-start';
    case 'minimal': return 'flex flex-col items-center text-center';
    case 'standard':
    default: return 'flex justify-between items-start';
  }
};

const getBorderClass = (style?: string) => {
  return style === 'sharp' ? 'rounded-none' : 'rounded-xl';
};

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data, template, primaryColor }, ref) => {
    const renderTemplate = () => {
      switch (template) {
        case 'luxury':
          return <LuxuryTemplate data={data} primaryColor={primaryColor} />;
        case 'minimal':
        case 'international':
        case 'manufacturing':
        case 'logistics':
        case 'modern':
        default:
          return <MinimalTemplate data={data} primaryColor={primaryColor} />;
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-full max-w-[800px] mx-auto min-h-[1131px] shadow-2xl print:shadow-none print:m-0 print:w-full print:max-w-none",
          template === 'luxury' ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800'
        )}
        style={{ '--primary': primaryColor } as React.CSSProperties}
      >
        {renderTemplate()}
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';

// --- Templates ---

const LuxuryTemplate = ({ data, primaryColor }: { data: InvoiceData; primaryColor: string }) => {
  const settings = data.template_settings || {};
  const fontClass = getFontClass(settings.fontPairing);
  const tableClass = getTableClass(settings.tableStyle, true);
  const logoClass = getLogoClass(settings.logoPlacement);
  const headerLayoutClass = getHeaderLayoutClass(settings.headerLayout);
  const actualPrimaryColor = settings.primaryColor || primaryColor;
  const secondaryColor = settings.secondaryColor || '#94a3b8'; // slate-400
  const accentColor = settings.accentColor || actualPrimaryColor;

  return (
    <div className={cn("p-12 relative overflow-hidden min-h-[1131px] flex flex-col", fontClass)}>
      {/* Background Accent */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 opacity-10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3"
        style={{ backgroundColor: actualPrimaryColor }}
      />

      <div className={cn("relative z-10 mb-16 border-b border-slate-800 pb-8", headerLayoutClass)}>
        <div className={settings.headerLayout === 'minimal' ? 'w-full flex flex-col items-center mb-8' : ''}>
          {data.logo ? (
            <img src={data.logo} alt="Logo" className={cn("h-16 object-contain mb-6", logoClass)} />
          ) : (
            <div className={cn("h-16 flex items-center mb-6", logoClass)}>
              <span className="text-2xl font-bold tracking-widest text-white uppercase">{data.seller?.name || 'COMPANY'}</span>
            </div>
          )}
          <div className={cn("space-y-1 text-sm text-slate-400", settings.headerLayout === 'minimal' ? 'text-center' : '')}>
            <p className="font-medium text-slate-300">{data.seller?.name}</p>
            <p className="whitespace-pre-wrap">{data.seller?.address}</p>
            {data.seller?.email && <p>{data.seller.email}</p>}
            {data.seller?.phone && <p>{data.seller.phone}</p>}
            {data.seller?.taxId && <p>Tax ID: {data.seller.taxId}</p>}
          </div>
        </div>
        <div className={settings.headerLayout === 'minimal' ? 'w-full text-center' : 'text-right'}>
          <h1 className="text-4xl font-light tracking-widest text-white mb-6 uppercase" style={{ color: actualPrimaryColor }}>
            {data.invoice_meta?.type === 'proforma' ? 'Proforma Invoice' : 
             data.invoice_meta?.type === 'packing_list' ? 'Packing List' : 'Invoice'}
          </h1>
          <div className={cn("space-y-2 text-sm", settings.headerLayout === 'minimal' ? 'flex flex-col items-center' : '')}>
            <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="text-slate-500">Invoice No.</span>
              <span className="font-medium text-white">{data.invoice_meta?.invoiceNumber}</span>
            </div>
            <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="text-slate-500">Issue Date</span>
              <span className="font-medium text-white">{data.invoice_meta?.issueDate}</span>
            </div>
            {data.invoice_meta?.dueDate && (
              <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-white">{data.invoice_meta?.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 mb-12">
        <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4" style={{ color: secondaryColor }}>Billed To</h3>
        <div className="space-y-1 text-sm">
          <p className="font-medium text-white text-lg">{data.buyer?.name}</p>
          <p className="whitespace-pre-wrap text-slate-400">{data.buyer?.address}</p>
          {data.buyer?.email && <p className="text-slate-400">{data.buyer.email}</p>}
          {data.buyer?.phone && <p className="text-slate-400">{data.buyer.phone}</p>}
          {data.buyer?.taxId && <p className="text-slate-400">Tax ID: {data.buyer.taxId}</p>}
        </div>
      </div>

      <div className="relative z-10 flex-grow">
        <div className={cn(settings.tableStyle === 'bordered' ? cn('overflow-hidden', getBorderClass(settings.borderStyle)) : '')}>
          <table className={cn("w-full text-sm text-left", settings.tableStyle === 'bordered' ? tableClass : '')}>
            <thead>
            <tr className="border-b border-slate-800 text-slate-500">
              <th className="py-4 px-2 font-medium uppercase tracking-wider text-xs">Description</th>
              <th className="py-4 px-2 font-medium uppercase tracking-wider text-xs text-center w-24">Qty</th>
              <th className="py-4 px-2 font-medium uppercase tracking-wider text-xs text-right w-32">Price</th>
              <th className="py-4 px-2 font-medium uppercase tracking-wider text-xs text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className={settings.tableStyle !== 'bordered' ? tableClass : ''}>
            {data.items?.map((item, index) => (
              <tr key={item.id || index} className="group">
                <td className="py-6 px-2">
                  <p className="font-medium text-white mb-1">{item.item}</p>
                  {(item.description || item.specification || item.model) && (
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {[item.model, item.specification, item.description].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </td>
                <td className="py-6 px-2 text-center text-slate-300">{item.quantity}</td>
                <td className="py-6 px-2 text-right text-slate-300">{formatCurrency(item.unitPrice, data.currency)}</td>
                <td className="py-6 px-2 text-right font-medium text-white">{formatCurrency(item.amount, data.currency)}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <div className="relative z-10 flex justify-end mt-8 mb-16">
        <div className="w-80 space-y-4">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Subtotal</span>
            <span>{formatCurrency(data.subtotal, data.currency)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span>Discount</span>
              <span>-{formatCurrency(data.discount, data.currency)}</span>
            </div>
          )}
          {data.tax?.amount > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span>Tax ({data.tax.rate}%)</span>
              <span>{formatCurrency(data.tax.amount, data.currency)}</span>
            </div>
          )}
          {data.shipping > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span>Shipping</span>
              <span>{formatCurrency(data.shipping, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <span className="font-medium text-white">Total</span>
            <span className="text-2xl font-light text-white" style={{ color: accentColor }}>
              {formatCurrency(data.total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className={cn(
        "relative z-10 text-sm mt-auto pt-12 border-t border-slate-800",
        settings.footerLayout === 'columns' ? 'grid grid-cols-3 gap-8' :
        settings.footerLayout === 'minimal' ? 'flex flex-col items-center text-center space-y-6' :
        'grid grid-cols-2 gap-12'
      )}>
        {data.payment_details && (
          <div>
            <h4 className="font-bold tracking-widest text-slate-500 uppercase text-xs mb-3" style={{ color: secondaryColor }}>Payment Details</h4>
            <p className="whitespace-pre-wrap text-slate-400 leading-relaxed">{data.payment_details}</p>
          </div>
        )}
        {data.bank_details && (
          <div>
            <h4 className="font-bold tracking-widest text-slate-500 uppercase text-xs mb-3" style={{ color: secondaryColor }}>Bank Details</h4>
            <p className="whitespace-pre-wrap text-slate-400 leading-relaxed">{data.bank_details}</p>
          </div>
        )}
        {data.notes && (
          <div className={settings.footerLayout === 'columns' ? 'col-span-3' : settings.footerLayout === 'minimal' ? '' : 'col-span-2'}>
            <h4 className="font-bold tracking-widest text-slate-500 uppercase text-xs mb-3" style={{ color: secondaryColor }}>Notes</h4>
            <p className="whitespace-pre-wrap text-slate-400 leading-relaxed">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MinimalTemplate = ({ data, primaryColor }: { data: InvoiceData; primaryColor: string }) => {
  const settings = data.template_settings || {};
  const fontClass = getFontClass(settings.fontPairing);
  const tableClass = getTableClass(settings.tableStyle, false);
  const logoClass = getLogoClass(settings.logoPlacement);
  const headerLayoutClass = getHeaderLayoutClass(settings.headerLayout);
  const actualPrimaryColor = settings.primaryColor || primaryColor;
  const secondaryColor = settings.secondaryColor || '#64748b'; // slate-500
  const accentColor = settings.accentColor || actualPrimaryColor;

  return (
    <div className={cn("p-12 min-h-[1131px] flex flex-col", fontClass)}>
      <div className={cn("mb-12", headerLayoutClass)}>
        <div className={settings.headerLayout === 'minimal' ? 'w-full flex flex-col items-center mb-8' : ''}>
          {data.logo ? (
            <img src={data.logo} alt="Logo" className={cn("h-16 object-contain mb-4", logoClass)} />
          ) : (
            <div className={cn("h-16 flex items-center mb-4", logoClass)}>
              <span className="text-2xl font-bold tracking-tight text-slate-900">{data.seller?.name || 'COMPANY'}</span>
            </div>
          )}
          <div className={cn("space-y-1 text-sm text-slate-600", settings.headerLayout === 'minimal' ? 'text-center' : '')}>
            <p className="font-medium text-slate-900">{data.seller?.name}</p>
            <p className="whitespace-pre-wrap">{data.seller?.address}</p>
            {data.seller?.email && <p>{data.seller.email}</p>}
            {data.seller?.phone && <p>{data.seller.phone}</p>}
            {data.seller?.taxId && <p>Tax ID: {data.seller.taxId}</p>}
          </div>
        </div>
        <div className={settings.headerLayout === 'minimal' ? 'w-full text-center' : 'text-right'}>
          <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-6" style={{ color: actualPrimaryColor }}>
            {data.invoice_meta?.type === 'proforma' ? 'PROFORMA INVOICE' : 
             data.invoice_meta?.type === 'packing_list' ? 'PACKING LIST' : 'INVOICE'}
          </h1>
          <div className={cn("space-y-2 text-sm", settings.headerLayout === 'minimal' ? 'flex flex-col items-center' : '')}>
            <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="text-slate-500">Invoice No.</span>
              <span className="font-medium text-slate-900">{data.invoice_meta?.invoiceNumber}</span>
            </div>
            <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="text-slate-500">Issue Date</span>
              <span className="font-medium text-slate-900">{data.invoice_meta?.issueDate}</span>
            </div>
            {data.invoice_meta?.dueDate && (
              <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-slate-900">{data.invoice_meta?.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3" style={{ color: secondaryColor }}>Billed To</h3>
        <div className="space-y-1 text-sm">
          <p className="font-medium text-slate-900 text-base">{data.buyer?.name}</p>
          <p className="whitespace-pre-wrap text-slate-600">{data.buyer?.address}</p>
          {data.buyer?.email && <p className="text-slate-600">{data.buyer.email}</p>}
          {data.buyer?.phone && <p className="text-slate-600">{data.buyer.phone}</p>}
          {data.buyer?.taxId && <p className="text-slate-600">Tax ID: {data.buyer.taxId}</p>}
        </div>
      </div>

      <div className="flex-grow">
        <div className={cn(settings.tableStyle === 'bordered' ? cn('overflow-hidden', getBorderClass(settings.borderStyle)) : '')}>
          <table className={cn("w-full text-sm text-left", settings.tableStyle === 'bordered' ? tableClass : '')}>
            <thead>
            <tr className="border-b-2 border-slate-200 text-slate-900">
              <th className="py-3 px-2 font-semibold">Description</th>
              <th className="py-3 px-2 font-semibold text-center w-24">Qty</th>
              <th className="py-3 px-2 font-semibold text-right w-32">Price</th>
              <th className="py-3 px-2 font-semibold text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody className={settings.tableStyle !== 'bordered' ? tableClass : ''}>
            {data.items?.map((item, index) => (
              <tr key={item.id || index}>
                <td className="py-4 px-2">
                  <p className="font-medium text-slate-900">{item.item}</p>
                  {(item.description || item.specification || item.model) && (
                    <p className="text-slate-500 text-xs mt-1">
                      {[item.model, item.specification, item.description].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </td>
                <td className="py-4 px-2 text-center text-slate-700">{item.quantity}</td>
                <td className="py-4 px-2 text-right text-slate-700">{formatCurrency(item.unitPrice, data.currency)}</td>
                <td className="py-4 px-2 text-right font-medium text-slate-900">{formatCurrency(item.amount, data.currency)}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-8 mb-16">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(data.subtotal, data.currency)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Discount</span>
              <span>-{formatCurrency(data.discount, data.currency)}</span>
            </div>
          )}
          {data.tax?.amount > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>Tax ({data.tax.rate}%)</span>
              <span>{formatCurrency(data.tax.amount, data.currency)}</span>
            </div>
          )}
          {data.shipping > 0 && (
            <div className="flex justify-between text-sm text-slate-600">
              <span>Shipping</span>
              <span>{formatCurrency(data.shipping, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
            <span className="font-bold text-slate-900">Total</span>
            <span className="text-xl font-bold text-slate-900" style={{ color: accentColor }}>
              {formatCurrency(data.total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      <div className={cn(
        "text-sm mt-auto pt-8 border-t border-slate-200",
        settings.footerLayout === 'columns' ? 'grid grid-cols-3 gap-8' :
        settings.footerLayout === 'minimal' ? 'flex flex-col items-center text-center space-y-6' :
        'grid grid-cols-2 gap-8'
      )}>
        {data.payment_details && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2" style={{ color: secondaryColor }}>Payment Details</h4>
            <p className="whitespace-pre-wrap text-slate-600">{data.payment_details}</p>
          </div>
        )}
        {data.bank_details && (
          <div>
            <h4 className="font-semibold text-slate-900 mb-2" style={{ color: secondaryColor }}>Bank Details</h4>
            <p className="whitespace-pre-wrap text-slate-600">{data.bank_details}</p>
          </div>
        )}
        {data.notes && (
          <div className={settings.footerLayout === 'columns' ? 'col-span-3' : settings.footerLayout === 'minimal' ? '' : 'col-span-2'}>
            <h4 className="font-semibold text-slate-900 mb-2" style={{ color: secondaryColor }}>Notes</h4>
            <p className="whitespace-pre-wrap text-slate-600">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
