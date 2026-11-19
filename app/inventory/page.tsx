"use client";
import useSWR from "swr";
import { useState } from "react";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InventoryPage() {
  const { data, mutate } = useSWR("/api/inventory/items", fetcher);
  const [form, setForm] = useState({ name: "", sku: "", quantity: 0, minThreshold: 5, description: "", supplierName: "", supplierEmail: "", supplierPhone: "" });
  const [adjust, setAdjust] = useState<{ id: string; delta: number; reason: string } | null>(null);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/inventory/items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", sku: "", quantity: 0, minThreshold: 5, description: "", supplierName: "", supplierEmail: "", supplierPhone: "" });
    mutate();
  }

  async function doAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!adjust) return;
    await fetch("/api/inventory/adjust", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(adjust) });
    setAdjust(null);
    mutate();
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Inventory</h1>
      <form onSubmit={createItem} className="bg-white p-6 rounded-xl shadow-sm border mb-8 grid grid-cols-2 gap-4">
        <input placeholder="Name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="border p-2 rounded" />
        <input placeholder="SKU" value={form.sku} onChange={(e)=>setForm({...form,sku:e.target.value})} className="border p-2 rounded" />
        <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e)=>setForm({...form,quantity:Number(e.target.value)})} className="border p-2 rounded" />
        <input type="number" placeholder="Min threshold" value={form.minThreshold} onChange={(e)=>setForm({...form,minThreshold:Number(e.target.value)})} className="border p-2 rounded" />
        <input placeholder="Supplier name" value={form.supplierName} onChange={(e)=>setForm({...form,supplierName:e.target.value})} className="border p-2 rounded" />
        <input placeholder="Supplier email" value={form.supplierEmail} onChange={(e)=>setForm({...form,supplierEmail:e.target.value})} className="border p-2 rounded" />
        <button className="col-span-2 bg-blue-600 text-white p-2 rounded font-semibold">Add Item</button>
      </form>

      {adjust && (
        <form onSubmit={doAdjust} className="bg-yellow-50 p-4 rounded-xl border mb-6 flex gap-2 items-center">
          <span className="text-sm">Adjust:</span>
          <input type="number" placeholder="delta (+/-)" value={adjust.delta} onChange={(e)=>setAdjust({...adjust,delta:Number(e.target.value)})} className="border p-2 rounded w-24" />
          <input placeholder="reason" value={adjust.reason} onChange={(e)=>setAdjust({...adjust,reason:e.target.value})} className="border p-2 rounded" />
          <button className="bg-blue-600 text-white p-2 rounded">Apply</button>
          <button type="button" onClick={()=>setAdjust(null)} className="text-gray-500">Cancel</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {data?.items?.length ? data.items.map((it: any) => (
          <div key={it.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{it.name} {it.sku ? `(${it.sku})` : ""}</p>
              <p className="text-sm text-gray-500">Qty: {it.quantity} / Min: {it.minThreshold} {it.quantity <= it.minThreshold ? "⚠ LOW" : ""}</p>
            </div>
            <button onClick={()=>setAdjust({ id: it.id, delta: 0, reason: "manual" })} className="text-blue-600 text-sm">Adjust</button>
          </div>
        )) : <div className="p-4 text-gray-500 text-sm">No items yet.</div>}
      </div>
    </main>
  );
}