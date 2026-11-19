"use client";
import useSWR from "swr";
import Link from "next/link";
const fetcher = (url: string) => fetch(url).then((r) => r.json());
export default function DashboardPage() {
  const { data, error } = useSWR("/api/dashboard", fetcher);
  if (error) return <main className="p-8">Failed to load.</main>;
  if (!data) return <main className="p-8">Loading...</main>;
  const m = data.metrics;
  const cards = [
    { label: "Total Items", value: m.totalItems },
    { label: "Low Stock", value: m.lowStock },
    { label: "Out of Stock", value: m.outOfStock },
  ];
  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/inventory" className="text-blue-600">Inventory</Link>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500 text-sm">{c.label}</p>
            <p className="text-3xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold mb-4">Recent Adjustments</h2>
      <div className="bg-white rounded-xl shadow-sm border divide-y mb-8">
        {data.recentAdjustments?.length ? data.recentAdjustments.map((a: any) => (
          <div key={a.id} className="p-4 text-sm">{a.item?.name} {a.delta > 0 ? "+" : ""}{a.delta} ({a.reason}) — {new Date(a.createdAt).toLocaleString()}</div>
        )) : <div className="p-4 text-gray-500 text-sm">No adjustments yet.</div>}
      </div>
      <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
      <div className="bg-white rounded-xl shadow-sm border divide-y">
        {data.recentAlerts?.length ? data.recentAlerts.map((a: any) => (
          <div key={a.id} className="p-4 text-sm">{a.item?.name} — qty {a.quantity} (min {a.threshold}) {a.resolved ? "resolved" : "OPEN"} — {new Date(a.createdAt).toLocaleString()}</div>
        )) : <div className="p-4 text-gray-500 text-sm">No alerts yet.</div>}
      </div>
    </main>
  );
}