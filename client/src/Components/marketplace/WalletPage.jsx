import React from 'react';
import { Info, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { walletData } from '../../Data/marketplaceData';
import CreditCard from '../marketplace/credit-card';
import TransactionsTable from '../marketplace/transactions-table';
import RevenueChart from '../marketplace/RevenueChart';
const WalletPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Wallet</h1>
        <div className="text-sm text-gray-500">{walletData.currentDate}</div>
      </div>

      {/* Main Layout - Left Column (All Components) and Right Column (Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - All Components Stacked Vertically */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Section - Earnings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Earnings Card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Earnings</h3>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{walletData.totalEarnings}</div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600">This Month you had a profit</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {walletData.profitPercentage}+
                </span>
              </div>
            </div>

            {/* Pending Earnings Card */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Earnings</h3>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{walletData.pendingEarnings}</div>
            </div>
          </div>

          {/* Revenue Chart */}
          <RevenueChart />

          {/* Accounts Section */}
          <CreditCard />
          {/* <div className="bg-white rounded-lg border p-6">
            <div className="text-lg font-semibold text-gray-900 mb-6">Accounts</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {walletData.accounts.map((account) => (
                <div key={account.id} className={`bg-gradient-to-br ${account.gradient} rounded-xl p-4 text-white relative h-24`}>
                  <div className="flex justify-between items-start mb-2">
                    <div></div>
                    <div className="text-xs font-medium">{account.bankName}</div>
                  </div>
                  <div className="text-sm font-semibold mb-1">{account.cardNumber}</div>
                  <div className="text-xs opacity-90 mb-2">{account.accountNumber}</div>
                  <div className="text-xs font-medium">{account.holderName}</div>
                </div>
              ))}
            </div>

            <button className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-blue-600 hover:text-blue-700 font-medium hover:bg-gray-50 transition-colors">
              + Add Bank Details
            </button>
          </div> */}
        </div>

        {/* Right Column - Transactions (Full Height) */}
        <TransactionsTable />
      </div>
    </div>
  );
};

export default WalletPage;
