import { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";

function Badge({ variant = "default", children }) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variants = {
    default: "bg-blue-600 text-white border-transparent",
    secondary: "bg-gray-200 text-gray-800 border-transparent",
    destructive: "bg-red-500 text-white border-transparent",
    outline: "text-gray-800 border",
  };
  return <div className={`${base} ${variants[variant]}`}>{children}</div>;
}

const chartData = [
  { month: "Jan", value: 80 },
  { month: "Feb", value: 85 },
  { month: "Mar", value: 55 },
  { month: "Apr", value: 40 },
  { month: "May", value: 25 },
  { month: "Jun", value: 90 },
  { month: "Jul", value: 100 },
];

const transactionData = [
  { id: 1, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 2, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 3, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 4, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 5, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 6, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 7, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 8, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 9, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  { id: 10, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
];

export default function PaymentOverview() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Payment Overview
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            May, 2025
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Total Payouts */}
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">Total Payouts</h3>
              <div className="text-2xl font-bold mt-2">₹1,60,000</div>
              <p className="text-xs text-gray-400 mt-1">Paid to License Partners</p>
            </div>

            {/* Revenue */}
            <div className="p-4 bg-white shadow rounded-lg">
              <h3 className="text-sm font-medium text-gray-500">
                Revenue from Hiring Companies
              </h3>
              <div className="text-2xl font-bold mt-2">₹1,25,000</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-400">
                  Your earnings from job postings and hires.
                </p>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+20%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Payouts</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <span className="text-sm font-medium text-gray-900">Payouts</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                            <p className="text-lg font-medium text-gray-600">{label}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                              <span className="text-sm font-medium">
                                Payouts {payload[0].value}k
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x="May" stroke="#000" strokeWidth={2} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#payoutGradient)"
                    strokeWidth={3}
                    dot={(props) =>
                      props.payload.month === "May" ? (
                        <Dot cx={props.cx} cy={props.cy} r={6} fill="white" stroke="#000" strokeWidth={2} />
                      ) : (
                        <Dot cx={props.cx} cy={props.cy} r={0} />
                      )
                    }
                    activeDot={{ r: 6, stroke: "#000", strokeWidth: 2, fill: "white" }}
                  />
                  <defs>
                    <linearGradient id="payoutGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#94a3b8" />
                      <stop offset="60%" stopColor="#64748b" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Activity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-3 px-4 text-sm font-medium">{t.company}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{t.date}</td>
                    <td className="py-3 px-4">
                      <Badge variant="secondary">{t.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-right">{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
