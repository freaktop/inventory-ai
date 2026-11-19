import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Inventory AI</h1>
        <p className="text-xl text-gray-600 mb-8">Track stock and receive low-stock alerts before you run out.</p>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">Business Login</Link>
      </section>
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-4">Pricing</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border inline-block">
          <p className="text-3xl font-bold">$249 <span className="text-base font-normal text-gray-500">setup</span></p>
          <p className="text-3xl font-bold mt-2">$79 <span className="text-base font-normal text-gray-500">/ month</span></p>
        </div>
      </section>
    </main>
  );
}