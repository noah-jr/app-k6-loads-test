"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [users, setUsers] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [metrics, setMetrics] = useState<any>(null);

  const handleRunTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult("");
    setMetrics(null);

    const res = await fetch("/api/run-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, users }),
    });

    const data = await res.json();
    setResult(data.output || "Erro ao rodar o teste.");
    setMetrics(data.metrics || null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🚀 Teste de Carga com K6
        </h1>
        <form onSubmit={handleRunTest} className="space-y-4">
          <input
            type="text"
            placeholder="URL da aplicação"
            className="w-full px-4 py-2 border rounded-lg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            placeholder="Número de utilizadores"
            className="w-full px-4 py-2 border rounded-lg"
            value={users}
            onChange={(e) => setUsers(Number(e.target.value))}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Rodando teste..." : "Executar Teste"}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-black text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
            <pre>{result}</pre>
          </div>
        )}

        {metrics && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">📊 Requisições por segundo</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={[{ name: "RPS", value: metrics.rps }]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4f46e5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">⏱ Latência Média (ms)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{ name: "Latência", value: metrics.avgLatency }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold mb-2">❌ Erros</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[{ name: "Erros", value: metrics.errors }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
