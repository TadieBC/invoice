import React from 'react';
import { InvoiceData } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { getFontClass, getTableClass, getLogoClass, getHeaderLayoutClass, getBorderClass } from '../InvoicePreview';

export const DarkProfessionalTemplate = ({ data, primaryColor }: { data: InvoiceData; primaryColor: string }) => {
  const settings = data.template_settings || {} as any;
  const fontClass = getFontClass(settings.fontPairing);
  const tableClass = getTableClass(settings.tableStyle, true);
  const logoClass = getLogoClass(settings.logoPlacement);
  const headerLayoutClass = getHeaderLayoutClass(settings.headerLayout);
  const actualPrimaryColor = settings.primaryColor || primaryColor;
  const secondaryColor = settings.secondaryColor || '#94a3b8'; // slate-400
  const accentColor = settings.accentColor || actualPrimaryColor;

  return (
    <div className={cn("p-12 min-h-[1123px] flex flex-col bg-slate-900 text-slate-300", fontClass)}>
      {/* Header */}
      <div className={cn("mb-12 pb-8 border-b border-slate-800", headerLayoutClass)}>
        <div className={settings.headerLayout === 'minimal' ? 'w-full flex flex-col items-center mb-8' : ''}>
          {data.logo ? (
            <img src={data.logo} alt="Logo" className={cn("max-h-24 max-w-[240px] object-contain mb-4 bg-white p-2 rounded-lg", logoClass)} />
          ) : (
            <div className={cn("h-16 flex items-center mb-4", logoClass)}>
              <span className="text-2xl font-bold tracking-tight text-white">{data.seller?.name || 'COMPANY'}</span>
            </div>
          )}
          <div className={cn("text-sm text-slate-400 max-w-md", settings.headerLayout === 'minimal' ? 'text-center mx-auto' : '')}>
            <p className="font-medium text-slate-200 mb-1">{data.seller?.name}</p>
            {data.seller?.address && <p className="leading-snug mb-1">{data.seller.address.replace(/\n/g, ', ')}</p>}
            <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-xs", settings.headerLayout === 'minimal' ? 'justify-center' : '')}>
              {data.seller?.email && <span>{data.seller.email}</span>}
              {data.seller?.phone && <span>{data.seller.phone}</span>}
              {data.seller?.taxId && <span>Tax ID: {data.seller.taxId}</span>}
            </div>
          </div>
        </div>
        <div className={settings.headerLayout === 'minimal' ? 'w-full text-center' : 'text-right'}>
          <h1 className="text-4xl font-bold tracking-tight mb-6 uppercase" style={{ color: actualPrimaryColor }}>
            {data.invoice_meta?.type === 'proforma' ? 'Proforma Invoice' : 
             data.invoice_meta?.type === 'packing_list' ? 'Packing List' : 'Commercial Invoice'}
          </h1>
          <div className={cn("space-y-2 text-sm", settings.headerLayout === 'minimal' ? 'flex flex-col items-center' : '')}>
            <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="text-slate-500 font-medium">Invoice No.</span>
              <span className="font-bold text-white">{data.invoice_meta?.invoiceNumber}</span>
            </div>
            <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="text-slate-500 font-medium">Issue Date</span>
              <span className="font-bold text-white">{data.invoice_meta?.issueDate}</span>
            </div>
            {data.invoice_meta?.dueDate && (
              <div className={cn("flex gap-4", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
                <span className="text-slate-500 font-medium">Due Date</span>
                <span className="font-bold text-white">{data.invoice_meta?.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parties & Commercial Details */}
      <div className="mb-12 grid grid-cols-2 gap-8">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: actualPrimaryColor }}>Billed To</h3>
          <div className="text-sm">
            <p className="font-bold text-white text-base mb-1">{data.buyer?.name}</p>
            {data.buyer?.contactPerson && <p className="text-slate-300 mb-1">{data.buyer.contactPerson}</p>}
            {data.buyer?.address && <p className="leading-snug text-slate-400 mb-1">{data.buyer.address.replace(/\n/g, ', ')}</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              {data.buyer?.email && <span>{data.buyer.email}</span>}
              {data.buyer?.phone && <span>{data.buyer.phone}</span>}
              {data.buyer?.taxId && <span>Tax ID: {data.buyer.taxId}</span>}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: actualPrimaryColor }}>Commercial Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-slate-400">
            {data.invoice_meta?.incoterm && (
              <>
                <span className="font-medium">Incoterm</span>
                <span className="font-bold text-white">{data.invoice_meta.incoterm}</span>
              </>
            )}
            {data.invoice_meta?.paymentTerm && (
              <>
                <span className="font-medium">Payment Term</span>
                <span className="font-bold text-white">{data.invoice_meta.paymentTerm}</span>
              </>
            )}
            {data.invoice_meta?.shipmentMethod && (
              <>
                <span className="font-medium">Shipment Method</span>
                <span className="font-bold text-white">{data.invoice_meta.shipmentMethod}</span>
              </>
            )}
            {data.invoice_meta?.portOfLoading && (
              <>
                <span className="font-medium">Port of Loading</span>
                <span className="font-bold text-white">{data.invoice_meta.portOfLoading}</span>
              </>
            )}
            {data.invoice_meta?.portOfDischarge && (
              <>
                <span className="font-medium">Port of Discharge</span>
                <span className="font-bold text-white">{data.invoice_meta.portOfDischarge}</span>
              </>
            )}
            {data.invoice_meta?.countryOfOrigin && (
              <>
                <span className="font-medium">Country of Origin</span>
                <span className="font-bold text-white">{data.invoice_meta.countryOfOrigin}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="flex-grow">
        <div className={cn("bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden", getBorderClass(settings.borderStyle))}>
          <table className={cn("w-full text-sm text-left table-fixed break-words", tableClass)}>
            <thead className="bg-slate-800/80 border-b border-slate-700">
            <tr className="text-slate-300">
              <th className="py-3 px-4 font-bold w-[45%]">Description</th>
              <th className="py-3 px-4 font-bold text-center w-[15%]">Qty</th>
              <th className="py-3 px-4 font-bold text-right w-[20%]">Unit Price</th>
              <th className="py-3 px-4 font-bold text-right w-[20%]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.items?.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-slate-800/50">
                <td className="py-4 px-4">
                  <p className="font-bold text-white">{item.item}</p>
                  {(item.description || item.specification || item.model) && (
                    <p className="text-slate-400 text-xs mt-1">
                      {[item.model, item.specification, item.description].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </td>
                <td className="py-4 px-4 text-center font-medium text-slate-300">{item.quantity} {item.unit || ''}</td>
                <td className="py-4 px-4 text-right text-slate-300">{formatCurrency(item.unitPrice, data.currency)}</td>
                <td className="py-4 px-4 text-right font-bold text-white">{formatCurrency(item.amount, data.currency)}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end mt-8 mb-12">
        <div className="w-80 bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 space-y-3">
          <div className="flex justify-between text-sm text-slate-400">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold text-white">{formatCurrency(data.subtotal, data.currency)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-400">
              <span className="font-medium">Discount</span>
              <span className="font-bold">-{formatCurrency(data.discount, data.currency)}</span>
            </div>
          )}
          {data.tax?.amount > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span className="font-medium">Tax ({data.tax.rate}%)</span>
              <span className="font-bold text-white">{formatCurrency(data.tax.amount, data.currency)}</span>
            </div>
          )}
          {data.shipping > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span className="font-medium">Shipping</span>
              <span className="font-bold text-white">{formatCurrency(data.shipping, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-slate-700">
            <span className="font-bold text-white uppercase tracking-wider">Total</span>
            <span className="text-xl font-bold" style={{ color: actualPrimaryColor }}>
              {formatCurrency(data.total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "text-sm mt-auto pt-8 border-t border-slate-800",
        settings.footerLayout === 'columns' ? 'grid grid-cols-3 gap-8' :
        settings.footerLayout === 'minimal' ? 'flex flex-col items-center text-center space-y-6' :
        'grid grid-cols-2 gap-8'
      )}>
        {data.payment_details && (
          <div>
            <h4 className="font-bold tracking-wider uppercase text-xs mb-3" style={{ color: actualPrimaryColor }}>Payment Details</h4>
            <p className="whitespace-pre-wrap text-slate-400">{data.payment_details}</p>
          </div>
        )}
        {data.bank_details && (
          <div>
            <h4 className="font-bold tracking-wider uppercase text-xs mb-3" style={{ color: actualPrimaryColor }}>Bank Details</h4>
            <p className="whitespace-pre-wrap text-slate-400">{data.bank_details}</p>
          </div>
        )}
        {data.commercial_terms && Object.keys(data.commercial_terms).length > 0 && (
          <div className={settings.footerLayout === 'columns' ? 'col-span-3' : settings.footerLayout === 'minimal' ? '' : 'col-span-2'}>
            <h4 className="font-bold tracking-wider uppercase text-xs mb-3" style={{ color: actualPrimaryColor }}>Commercial Terms</h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-slate-400">
              {data.commercial_terms.ttTerms && <div><span className="text-slate-500 font-medium mr-2">T/T Terms:</span>{data.commercial_terms.ttTerms}</div>}
              {data.commercial_terms.validity && <div><span className="text-slate-500 font-medium mr-2">Validity:</span>{data.commercial_terms.validity}</div>}
              {data.commercial_terms.shippingTerms && <div><span className="text-slate-500 font-medium mr-2">Shipping Terms:</span>{data.commercial_terms.shippingTerms}</div>}
              {data.commercial_terms.deliveryLeadTime && <div><span className="text-slate-500 font-medium mr-2">Delivery Lead Time:</span>{data.commercial_terms.deliveryLeadTime}</div>}
              {data.commercial_terms.packagingTerms && <div><span className="text-slate-500 font-medium mr-2">Packaging:</span>{data.commercial_terms.packagingTerms}</div>}
              {data.commercial_terms.warrantyTerms && <div><span className="text-slate-500 font-medium mr-2">Warranty:</span>{data.commercial_terms.warrantyTerms}</div>}
            </div>
          </div>
        )}
        {data.notes && (
          <div className={settings.footerLayout === 'columns' ? 'col-span-3' : settings.footerLayout === 'minimal' ? '' : 'col-span-2'}>
            <h4 className="font-bold tracking-wider uppercase text-xs mb-3" style={{ color: actualPrimaryColor }}>Notes</h4>
            <p className="whitespace-pre-wrap text-slate-400">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
