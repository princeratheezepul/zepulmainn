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

// Empty transaction data - can be populated in the future
const transactionData = [
  // { id: 1, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 2, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 3, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 4, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 5, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 6, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 7, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 8, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 9, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
  // { id: 10, company: "ABC Tech Ltd.", date: "08-05-25", status: "Sent", amount: "₹41,216" },
];

export default function PaymentOverview() {
  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xl font-bold text-gray-900">
            Payment Overview
          </div>
          <div className="flex items-center bg-white border border-2-black p-1.5 rounded gap-2 text-xs text-back-200">
            <Calendar className="h-4 w-4" />
            May, 2025
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column */}
          <div className="space-y-3">
            {/* Total Payouts */}
            <div className="px-3 py-3 bg-white border hover:shadow-md rounded-lg">
              <div className="text-lg font-medium text-gray-500">Total Payouts</div>
              <div className="text-2xl font-bold mt-1">₹0</div>
              <p className="text-xs text-black-400 mt-2 mb-0">Paid to License Partners</p>
            </div>

            {/* Revenue */}
            <div className="px-3 py-3 bg-white border hover:shadow-md rounded-lg">
              <div className="text-lg font-medium text-gray-500">
                Revenue from Hiring Companies
              </div>
              <div className="text-2xl font-bold mt-2">₹0</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-black-400 mt-1 mb-0">
                  Your earnings from job postings and hires.
                </p>
                <div className="flex items-center gap-1 bg-green-100 px-1 py-0.5 rounded-full text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-medium">+0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Chart */}
          <div className="lg:col-span-2 bg-white border hover:shadow-md rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-lg font-semibold text-gray-900">Payouts</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                <span className="text-sm font-medium text-gray-900">Payouts</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg">
                            <p className="text-md font-medium text-gray-600 mb-1">{label}</p>
                            <div className="flex items-center gap-2 mb-1">
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
        <div className="bg-white border hover:shadow-md rounded-lg px-3 py-3 mt-0">
          <div className="text-lg font-semibold mb-1">Transaction History</div>
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
                {transactionData.length > 0 ? (
                  transactionData.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="py-3 px-4 text-sm font-medium">{t.company}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{t.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{t.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-right">{t.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center">
                      <div className="text-gray-500 text-lg font-medium mb-2">No Transactions</div>
                      <div className="text-gray-400 text-sm">Your transaction history will appear here</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
