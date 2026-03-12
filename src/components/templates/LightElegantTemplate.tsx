import React from 'react';
import { InvoiceData } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { getFontClass, getTableClass, getLogoClass, getHeaderLayoutClass, getBorderClass } from '../InvoicePreview';

export const LightElegantTemplate = ({ data, primaryColor }: { data: InvoiceData; primaryColor: string }) => {
  const settings = data.template_settings || {} as any;
  const fontClass = getFontClass(settings.fontPairing);
  const tableClass = getTableClass(settings.tableStyle, false);
  const logoClass = getLogoClass(settings.logoPlacement);
  const headerLayoutClass = getHeaderLayoutClass(settings.headerLayout);
  const actualPrimaryColor = settings.primaryColor || primaryColor;
  const secondaryColor = settings.secondaryColor || '#94a3b8'; // slate-400
  const accentColor = settings.accentColor || actualPrimaryColor;

  return (
    <div className={cn("p-16 min-h-[1123px] flex flex-col bg-white", fontClass)}>
      {/* Header */}
      <div className={cn("mb-16", headerLayoutClass)}>
        <div className={settings.headerLayout === 'minimal' ? 'w-full flex flex-col items-center mb-12' : ''}>
          {data.logo ? (
            <img src={data.logo} alt="Logo" className={cn("max-h-24 max-w-[240px] object-contain mb-6", logoClass)} />
          ) : (
            <div className={cn("h-12 flex items-center mb-6", logoClass)}>
              <span className="text-2xl font-light tracking-widest text-slate-800 uppercase">{data.seller?.name || 'COMPANY'}</span>
            </div>
          )}
          <div className={cn("text-sm text-slate-500 font-light leading-relaxed max-w-md", settings.headerLayout === 'minimal' ? 'text-center mx-auto' : '')}>
            <p className="font-normal text-slate-800 mb-1">{data.seller?.name}</p>
            {data.seller?.address && <p className="leading-snug mb-1">{data.seller.address.replace(/\n/g, ', ')}</p>}
            <div className={cn("flex flex-wrap gap-x-3 gap-y-1 text-xs", settings.headerLayout === 'minimal' ? 'justify-center' : '')}>
              {data.seller?.email && <span>{data.seller.email}</span>}
              {data.seller?.phone && <span>{data.seller.phone}</span>}
              {data.seller?.taxId && <span>Tax ID: {data.seller.taxId}</span>}
            </div>
          </div>
        </div>
        <div className={settings.headerLayout === 'minimal' ? 'w-full text-center' : 'text-right'}>
          <h1 className="text-4xl font-light tracking-widest text-slate-800 mb-8 uppercase" style={{ color: actualPrimaryColor }}>
            {data.invoice_meta?.type === 'proforma' ? 'Proforma' : 
             data.invoice_meta?.type === 'packing_list' ? 'Packing List' : 'Invoice'}
          </h1>
          <div className={cn("space-y-3 text-sm font-light text-slate-500", settings.headerLayout === 'minimal' ? 'flex flex-col items-center' : '')}>
            <div className={cn("flex gap-6", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="uppercase tracking-wider text-xs">No.</span>
              <span className="font-normal text-slate-800">{data.invoice_meta?.invoiceNumber}</span>
            </div>
            <div className={cn("flex gap-6", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
              <span className="uppercase tracking-wider text-xs">Date</span>
              <span className="font-normal text-slate-800">{data.invoice_meta?.issueDate}</span>
            </div>
            {data.invoice_meta?.dueDate && (
              <div className={cn("flex gap-6", settings.headerLayout === 'minimal' ? 'justify-center' : 'justify-end')}>
                <span className="uppercase tracking-wider text-xs">Due</span>
                <span className="font-normal text-slate-800">{data.invoice_meta?.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="mb-16 grid grid-cols-2 gap-16">
        <div>
          <h3 className="text-xs font-light tracking-widest text-slate-400 uppercase mb-6">Billed To</h3>
          <div className="text-sm font-light text-slate-500 leading-relaxed">
            <p className="font-normal text-slate-800 text-base mb-1">{data.buyer?.name}</p>
            {data.buyer?.contactPerson && <p className="mb-1">{data.buyer.contactPerson}</p>}
            {data.buyer?.address && <p className="leading-snug mb-1">{data.buyer.address.replace(/\n/g, ', ')}</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-1">
              {data.buyer?.email && <span>{data.buyer.email}</span>}
              {data.buyer?.phone && <span>{data.buyer.phone}</span>}
              {data.buyer?.taxId && <span>Tax ID: {data.buyer.taxId}</span>}
            </div>
          </div>
        </div>

        {(data.invoice_meta?.incoterm || data.invoice_meta?.paymentTerm || data.invoice_meta?.shipmentMethod || data.invoice_meta?.portOfLoading || data.invoice_meta?.portOfDischarge) && (
          <div>
            <h3 className="text-xs font-light tracking-widest text-slate-400 uppercase mb-6">Commercial Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-light text-slate-500">
              {data.invoice_meta?.incoterm && (
                <>
                  <span className="uppercase tracking-wider text-xs">Incoterm</span>
                  <span className="font-normal text-slate-800">{data.invoice_meta.incoterm}</span>
                </>
              )}
              {data.invoice_meta?.paymentTerm && (
                <>
                  <span className="uppercase tracking-wider text-xs">Payment Term</span>
                  <span className="font-normal text-slate-800">{data.invoice_meta.paymentTerm}</span>
                </>
              )}
              {data.invoice_meta?.shipmentMethod && (
                <>
                  <span className="uppercase tracking-wider text-xs">Shipment Method</span>
                  <span className="font-normal text-slate-800">{data.invoice_meta.shipmentMethod}</span>
                </>
              )}
              {data.invoice_meta?.portOfLoading && (
                <>
                  <span className="uppercase tracking-wider text-xs">Port of Loading</span>
                  <span className="font-normal text-slate-800">{data.invoice_meta.portOfLoading}</span>
                </>
              )}
              {data.invoice_meta?.portOfDischarge && (
                <>
                  <span className="uppercase tracking-wider text-xs">Port of Discharge</span>
                  <span className="font-normal text-slate-800">{data.invoice_meta.portOfDischarge}</span>
                </>
              )}
              {data.invoice_meta?.countryOfOrigin && (
                <>
                  <span className="uppercase tracking-wider text-xs">Country of Origin</span>
                  <span className="font-normal text-slate-800">{data.invoice_meta.countryOfOrigin}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Line Items */}
      <div className="flex-grow mb-16">
        <table className={cn("w-full text-sm text-left table-fixed break-words", tableClass)}>
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-4 px-2 font-light tracking-widest uppercase text-xs text-slate-400 w-[45%]">Description</th>
              <th className="py-4 px-2 font-light tracking-widest uppercase text-xs text-slate-400 text-center w-[15%]">Qty</th>
              <th className="py-4 px-2 font-light tracking-widest uppercase text-xs text-slate-400 text-right w-[20%]">Price</th>
              <th className="py-4 px-2 font-light tracking-widest uppercase text-xs text-slate-400 text-right w-[20%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items?.map((item, index) => (
              <tr key={item.id || index} className="border-b border-slate-100 last:border-0">
                <td className="py-6 px-2">
                  <p className="font-normal text-slate-800">{item.item}</p>
                  {(item.description || item.specification || item.model) && (
                    <p className="text-slate-500 font-light text-xs mt-2 leading-relaxed">
                      {[item.model, item.specification, item.description].filter(Boolean).join(' • ')}
                    </p>
                  )}
                </td>
                <td className="py-6 px-2 text-center font-light text-slate-600">{item.quantity}</td>
                <td className="py-6 px-2 text-right font-light text-slate-600">{formatCurrency(item.unitPrice, data.currency)}</td>
                <td className="py-6 px-2 text-right font-normal text-slate-800">{formatCurrency(item.amount, data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-80 space-y-4">
          <div className="flex justify-between text-sm font-light text-slate-500">
            <span>Subtotal</span>
            <span className="font-normal text-slate-800">{formatCurrency(data.subtotal, data.currency)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-sm font-light text-emerald-600">
              <span>Discount</span>
              <span className="font-normal">-{formatCurrency(data.discount, data.currency)}</span>
            </div>
          )}
          {data.tax?.amount > 0 && (
            <div className="flex justify-between text-sm font-light text-slate-500">
              <span>Tax ({data.tax.rate}%)</span>
              <span className="font-normal text-slate-800">{formatCurrency(data.tax.amount, data.currency)}</span>
            </div>
          )}
          {data.shipping > 0 && (
            <div className="flex justify-between text-sm font-light text-slate-500">
              <span>Shipping</span>
              <span className="font-normal text-slate-800">{formatCurrency(data.shipping, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <span className="font-light tracking-widest uppercase text-sm text-slate-800">Total</span>
            <span className="text-2xl font-normal" style={{ color: actualPrimaryColor }}>
              {formatCurrency(data.total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        "text-sm mt-auto pt-12 border-t border-slate-200",
        settings.footerLayout === 'columns' ? 'grid grid-cols-3 gap-12' :
        settings.footerLayout === 'minimal' ? 'flex flex-col items-center text-center space-y-8' :
        'grid grid-cols-2 gap-12'
      )}>
        {data.payment_details && (
          <div>
            <h4 className="font-light tracking-widest uppercase text-xs text-slate-400 mb-4">Payment Details</h4>
            <p className="whitespace-pre-wrap text-slate-600 font-light leading-relaxed">{data.payment_details}</p>
          </div>
        )}
        {data.bank_details && (
          <div>
            <h4 className="font-light tracking-widest uppercase text-xs text-slate-400 mb-4">Bank Details</h4>
            <p className="whitespace-pre-wrap text-slate-600 font-light leading-relaxed">{data.bank_details}</p>
          </div>
        )}
        {data.commercial_terms && Object.keys(data.commercial_terms).length > 0 && (
          <div className={settings.footerLayout === 'columns' ? 'col-span-3' : settings.footerLayout === 'minimal' ? '' : 'col-span-2'}>
            <h4 className="font-light tracking-widest uppercase text-xs text-slate-400 mb-4">Commercial Terms</h4>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-slate-600 font-light">
              {data.commercial_terms.ttTerms && <div><span className="uppercase tracking-wider text-xs text-slate-400 mr-3">T/T Terms:</span>{data.commercial_terms.ttTerms}</div>}
              {data.commercial_terms.validity && <div><span className="uppercase tracking-wider text-xs text-slate-400 mr-3">Validity:</span>{data.commercial_terms.validity}</div>}
              {data.commercial_terms.shippingTerms && <div><span className="uppercase tracking-wider text-xs text-slate-400 mr-3">Shipping Terms:</span>{data.commercial_terms.shippingTerms}</div>}
              {data.commercial_terms.deliveryLeadTime && <div><span className="uppercase tracking-wider text-xs text-slate-400 mr-3">Delivery Lead Time:</span>{data.commercial_terms.deliveryLeadTime}</div>}
              {data.commercial_terms.packagingTerms && <div><span className="uppercase tracking-wider text-xs text-slate-400 mr-3">Packaging:</span>{data.commercial_terms.packagingTerms}</div>}
              {data.commercial_terms.warrantyTerms && <div><span className="uppercase tracking-wider text-xs text-slate-400 mr-3">Warranty:</span>{data.commercial_terms.warrantyTerms}</div>}
            </div>
          </div>
        )}
        {data.notes && (
          <div className={settings.footerLayout === 'columns' ? 'col-span-3' : settings.footerLayout === 'minimal' ? '' : 'col-span-2'}>
            <h4 className="font-light tracking-widest uppercase text-xs text-slate-400 mb-4">Notes</h4>
            <p className="whitespace-pre-wrap text-slate-600 font-light leading-relaxed">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
