import React, { useState } from 'react';
import { InvoiceData } from '../types';
import { Plus, Trash2, Sparkles, Loader2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateInvoiceData } from '../services/ai';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface InvoiceEditorProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

const Input = ({ label, value, onChange, type = 'text', className = '' }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-medium text-slate-400">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    />
  </div>
);

const Textarea = ({ label, value, onChange, className = '' }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-xs font-medium text-slate-400">{label}</label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-md text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
    />
  </div>
);

const SortableItem: React.FC<{ item: any; removeItem: (id: string) => void; handleItemChange: (id: string, field: string, value: any) => void }> = ({ item, removeItem, handleItemChange }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform?.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 relative group flex gap-3">
      <div {...attributes} {...listeners} className="cursor-grab pt-8 text-slate-500 hover:text-slate-400 focus:outline-none">
        <GripVertical className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <button 
          onClick={() => removeItem(item.id)}
          className="absolute -right-2 -top-2 bg-red-500/10 text-red-400 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-500/20 hover:text-red-300"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-4">
            <Input label="Item Name" value={item.item} onChange={(v: string) => handleItemChange(item.id, 'item', v)} />
          </div>
          <div className="col-span-6 sm:col-span-2">
            <Input label="Model" value={item.model} onChange={(v: string) => handleItemChange(item.id, 'model', v)} />
          </div>
          <div className="col-span-6 sm:col-span-2">
            <Input label="Qty" type="number" value={item.quantity} onChange={(v: number) => handleItemChange(item.id, 'quantity', v)} />
          </div>
          <div className="col-span-6 sm:col-span-2">
            <Input label="Price" type="number" value={item.unitPrice} onChange={(v: number) => handleItemChange(item.id, 'unitPrice', v)} />
          </div>
          <div className="col-span-6 sm:col-span-2">
            <Input label="Amount" type="number" value={item.amount} onChange={(v: number) => handleItemChange(item.id, 'amount', v)} />
          </div>
          <div className="col-span-12">
            <Input label="Description / Specs" value={item.description || item.specification} onChange={(v: string) => handleItemChange(item.id, 'description', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="HS Code" value={item.hsCode} onChange={(v: string) => handleItemChange(item.id, 'hsCode', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="Origin" value={item.origin} onChange={(v: string) => handleItemChange(item.id, 'origin', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="Material" value={item.material} onChange={(v: string) => handleItemChange(item.id, 'material', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="Dimensions" value={item.dimensions} onChange={(v: string) => handleItemChange(item.id, 'dimensions', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="Color" value={item.color} onChange={(v: string) => handleItemChange(item.id, 'color', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="Net Weight" value={item.netWeight} onChange={(v: string) => handleItemChange(item.id, 'netWeight', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="Gross Weight" value={item.grossWeight} onChange={(v: string) => handleItemChange(item.id, 'grossWeight', v)} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Input label="CBM" value={item.cbm} onChange={(v: string) => handleItemChange(item.id, 'cbm', v)} />
          </div>
          <div className="col-span-12">
            <Input label="Remarks" value={item.remarks} onChange={(v: string) => handleItemChange(item.id, 'remarks', v)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ data, onChange }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const updatedData = await generateInvoiceData(aiPrompt, [], data);
      onChange(updatedData);
      setAiPrompt('');
    } catch (error) {
      console.error(error);
      alert('Failed to update invoice via AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    const currentItems = data.items || [];
    if (active.id !== over?.id) {
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);
      onChange({
        ...data,
        items: arrayMove(currentItems, oldIndex, newIndex),
      });
    }
  };

  const handleChange = (field: keyof InvoiceData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleMetaChange = (field: string, value: string) => {
    onChange({
      ...data,
      invoice_meta: {
        ...data.invoice_meta,
        [field]: value,
      },
    });
  };

  const handleCompanyChange = (type: 'seller' | 'buyer', field: string, value: string) => {
    onChange({
      ...data,
      [type]: {
        ...data[type],
        [field]: value,
      },
    });
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    const currentItems = data.items || [];
    const newItems = currentItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = Number(updatedItem.quantity || 0) * Number(updatedItem.unitPrice || 0);
        }
        return updatedItem;
      }
      return item;
    });
    
    const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subtotal * ((data.tax?.rate || 0) / 100);
    const total = subtotal + taxAmount + (data.shipping || 0) - (data.discount || 0);

    onChange({
      ...data,
      items: newItems,
      subtotal,
      tax: { ...data.tax, amount: taxAmount },
      total,
    });
  };

  const addItem = () => {
    const currentItems = data.items || [];
    onChange({
      ...data,
      items: [
        ...currentItems,
        {
          id: uuidv4(),
          item: '',
          description: '',
          model: '',
          specification: '',
          quantity: 1,
          unitPrice: 0,
          amount: 0,
        },
      ],
    });
  };

  const removeItem = (id: string) => {
    const currentItems = data.items || [];
    const newItems = currentItems.filter((item) => item.id !== id);
    const subtotal = newItems.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = subtotal * ((data.tax?.rate || 0) / 100);
    const total = subtotal + taxAmount + (data.shipping || 0) - (data.discount || 0);

    onChange({
      ...data,
      items: newItems,
      subtotal,
      tax: { ...data.tax, amount: taxAmount },
      total,
    });
  };

  return (
    <div className="space-y-8">
      {/* AI Editor Box */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-indigo-300 mb-1">Refine with AI</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., Change currency to EUR, add 10% tax, change buyer address to London..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIGenerate()}
              className="flex-1 px-3 py-2 bg-slate-900/50 border border-indigo-500/30 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <Input label="Invoice Number" value={data.invoice_meta?.invoiceNumber} onChange={(v: string) => handleMetaChange('invoiceNumber', v)} />
        <Input label="Issue Date" type="date" value={data.invoice_meta?.issueDate} onChange={(v: string) => handleMetaChange('issueDate', v)} />
        <Input label="Due Date" type="date" value={data.invoice_meta?.dueDate} onChange={(v: string) => handleMetaChange('dueDate', v)} />
        <Input label="Currency" value={data.currency} onChange={(v: string) => handleChange('currency', v)} />
        <Input label="Quotation Number" value={data.invoice_meta?.quotationNumber} onChange={(v: string) => handleMetaChange('quotationNumber', v)} />
        <Input label="PO Number" value={data.invoice_meta?.poNumber} onChange={(v: string) => handleMetaChange('poNumber', v)} />
        <Input label="Customer Ref" value={data.invoice_meta?.customerReference} onChange={(v: string) => handleMetaChange('customerReference', v)} />
        <Input label="Contract Ref" value={data.invoice_meta?.contractReference} onChange={(v: string) => handleMetaChange('contractReference', v)} />
        <Input label="Incoterm" value={data.invoice_meta?.incoterm} onChange={(v: string) => handleMetaChange('incoterm', v)} />
        <Input label="Payment Term" value={data.invoice_meta?.paymentTerm} onChange={(v: string) => handleMetaChange('paymentTerm', v)} />
        <Input label="Shipment Method" value={data.invoice_meta?.shipmentMethod} onChange={(v: string) => handleMetaChange('shipmentMethod', v)} />
        <Input label="Country of Origin" value={data.invoice_meta?.countryOfOrigin} onChange={(v: string) => handleMetaChange('countryOfOrigin', v)} />
        <Input label="Port of Loading" value={data.invoice_meta?.portOfLoading} onChange={(v: string) => handleMetaChange('portOfLoading', v)} />
        <Input label="Port of Discharge" value={data.invoice_meta?.portOfDischarge} onChange={(v: string) => handleMetaChange('portOfDischarge', v)} />
        <Input label="Product Category" value={data.invoice_meta?.productCategory} onChange={(v: string) => handleMetaChange('productCategory', v)} />
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-slate-100 border-b border-slate-700 pb-2">Seller Details</h3>
          <Input label="Company Name" value={data.seller?.name} onChange={(v: string) => handleCompanyChange('seller', 'name', v)} />
          <Textarea label="Address" value={data.seller?.address} onChange={(v: string) => handleCompanyChange('seller', 'address', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" value={data.seller?.email} onChange={(v: string) => handleCompanyChange('seller', 'email', v)} />
            <Input label="Phone" value={data.seller?.phone} onChange={(v: string) => handleCompanyChange('seller', 'phone', v)} />
            <Input label="Tax ID" value={data.seller?.taxId} onChange={(v: string) => handleCompanyChange('seller', 'taxId', v)} />
            <Input label="Registration No." value={data.seller?.registrationNumber} onChange={(v: string) => handleCompanyChange('seller', 'registrationNumber', v)} />
            <Input label="Website" value={data.seller?.website} onChange={(v: string) => handleCompanyChange('seller', 'website', v)} />
          </div>
        </div>
        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-slate-100 border-b border-slate-700 pb-2">Buyer Details</h3>
          <Input label="Company Name" value={data.buyer?.name} onChange={(v: string) => handleCompanyChange('buyer', 'name', v)} />
          <Textarea label="Address" value={data.buyer?.address} onChange={(v: string) => handleCompanyChange('buyer', 'address', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" value={data.buyer?.email} onChange={(v: string) => handleCompanyChange('buyer', 'email', v)} />
            <Input label="Phone" value={data.buyer?.phone} onChange={(v: string) => handleCompanyChange('buyer', 'phone', v)} />
            <Input label="Tax ID" value={data.buyer?.taxId} onChange={(v: string) => handleCompanyChange('buyer', 'taxId', v)} />
            <Input label="Registration No." value={data.buyer?.registrationNumber} onChange={(v: string) => handleCompanyChange('buyer', 'registrationNumber', v)} />
            <Input label="Contact Person" value={data.buyer?.contactPerson} onChange={(v: string) => handleCompanyChange('buyer', 'contactPerson', v)} />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
          <h3 className="font-semibold text-slate-100">Line Items</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
        <div className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={data.items?.map(i => i.id) || []} strategy={verticalListSortingStrategy}>
              {data.items?.map((item) => (
                <SortableItem key={item.id} item={item} removeItem={removeItem} handleItemChange={handleItemChange} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Totals & Additional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-slate-100 border-b border-slate-700 pb-2">Commercial Terms</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="T/T Terms" value={data.commercial_terms?.ttTerms} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, ttTerms: v })} />
            <Input label="Validity" value={data.commercial_terms?.validity} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, validity: v })} />
            <Input label="Shipping Terms" value={data.commercial_terms?.shippingTerms} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, shippingTerms: v })} />
            <Input label="Delivery Lead Time" value={data.commercial_terms?.deliveryLeadTime} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, deliveryLeadTime: v })} />
            <Input label="Packaging Terms" value={data.commercial_terms?.packagingTerms} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, packagingTerms: v })} />
            <Input label="Warranty Terms" value={data.commercial_terms?.warrantyTerms} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, warrantyTerms: v })} />
            <Input label="HS Code" value={data.commercial_terms?.hsCode} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, hsCode: v })} />
            <Input label="Delivery Terms" value={data.commercial_terms?.deliveryTerms} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, deliveryTerms: v })} />
            <div className="col-span-2">
              <Textarea label="Remarks / Notes" value={data.commercial_terms?.remarks} onChange={(v: string) => handleChange('commercial_terms', { ...data.commercial_terms, remarks: v })} />
            </div>
          </div>
        </div>
        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="font-semibold text-slate-100 border-b border-slate-700 pb-2">Additional Info</h3>
          <Textarea label="Payment Details" value={data.payment_details} onChange={(v: string) => handleChange('payment_details', v)} />
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-slate-300">Bank Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Beneficiary Name" value={data.bank_details?.beneficiaryName} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, beneficiaryName: v })} />
              <Input label="Bank Name" value={data.bank_details?.bankName} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, bankName: v })} />
              <Input label="Branch Name" value={data.bank_details?.branchName} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, branchName: v })} />
              <Input label="Bank Address" value={data.bank_details?.bankAddress} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, bankAddress: v })} />
              <Input label="Account Number" value={data.bank_details?.accountNumber} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, accountNumber: v })} />
              <Input label="SWIFT Code" value={data.bank_details?.swiftCode} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, swiftCode: v })} />
              <Input label="IBAN" value={data.bank_details?.iban} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, iban: v })} />
              <Input label="Routing Number" value={data.bank_details?.routingNumber} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, routingNumber: v })} />
              <Input label="Branch Code" value={data.bank_details?.branchCode} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, branchCode: v })} />
              <div className="col-span-2">
                <Textarea label="Currency Account Details" value={data.bank_details?.currencyAccountDetails} onChange={(v: string) => handleChange('bank_details', { ...data.bank_details, currencyAccountDetails: v })} />
              </div>
            </div>
          </div>
          <Textarea label="Notes" value={data.notes} onChange={(v: string) => handleChange('notes', v)} />
        </div>
        <div className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700 md:col-span-2">
          <h3 className="font-semibold text-slate-100 border-b border-slate-700 pb-2">Totals</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Input label="Subtotal" type="number" value={data.subtotal} onChange={(v: number) => handleChange('subtotal', v)} />
            <Input label="Tax Rate (%)" type="number" value={data.tax?.rate} onChange={(v: number) => handleChange('tax', { ...data.tax, rate: v })} />
            <Input label="Tax Amount" type="number" value={data.tax?.amount} onChange={(v: number) => handleChange('tax', { ...data.tax, amount: v })} />
            <Input label="Shipping" type="number" value={data.shipping} onChange={(v: number) => handleChange('shipping', v)} />
            <Input label="Discount" type="number" value={data.discount} onChange={(v: number) => handleChange('discount', v)} />
            <Input label="Grand Total" type="number" value={data.total} onChange={(v: number) => handleChange('total', v)} />
          </div>
        </div>
      </div>
    </div>
  );
};
