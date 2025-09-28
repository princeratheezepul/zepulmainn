import React from 'react';
import { TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { walletData } from '../../Data/marketplaceData';
import CreditCard from '../marketplace/credit-card';
import TransactionsTable from '../marketplace/Transactions-table';
import RevenueChart from '../marketplace/RevenueChart';
const WalletPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xl font-bold text-gray-900">Your Wallet</div>
        <div className="text-sm font-semibold text-gray-500">{walletData.currentDate}</div>
      </div>
      
      {/* Main Layout - Left Column (All Components) and Right Column (Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Left Column - All Components Stacked Vertically */}
        <div className=" space-y-6">
          {/* Top Section - Earnings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            {/* Total Earnings Card */}
            <div className="bg-white rounded-lg border p-3 hover:shadow-md">
              <div className="flex items-center mb-2">
                <div className="text-md font-semibold text-gray-900 mr-3">Total Earnings</div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0001 18.3332C14.5834 18.3332 18.3334 14.5832 18.3334 9.99984C18.3334 5.4165 14.5834 1.6665 10.0001 1.6665C5.41675 1.6665 1.66675 5.4165 1.66675 9.99984C1.66675 14.5832 5.41675 18.3332 10.0001 18.3332Z" stroke="#474747" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 6.6665V10.8332" stroke="#474747" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99536 13.3335H10.0028" stroke="#474747" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

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
            <div className="bg-white rounded-lg border p-3 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="text-md font-semibold text-gray-900">Pending Earnings</div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.0001 18.3332C14.5834 18.3332 18.3334 14.5832 18.3334 9.99984C18.3334 5.4165 14.5834 1.6665 10.0001 1.6665C5.41675 1.6665 1.66675 5.4165 1.66675 9.99984C1.66675 14.5832 5.41675 18.3332 10.0001 18.3332Z" stroke="#474747" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 6.6665V10.8332" stroke="#474747" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M9.99536 13.3335H10.0028" stroke="#474747" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
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


// import React from "react";

// export default function WalletPage() {
//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       {/* Grid: 50% - 50% */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
//         {/* Left Side */}
//         <div className="space-y-6">
//           {/* Earnings Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {/* Total Earnings */}
//             <div className="bg-white rounded-xl shadow p-4">
//               <div className="flex justify-between items-center">
//                 <p className="text-gray-500 text-sm">Total Earnings</p>
//                 <span className="text-gray-400 text-xs cursor-pointer">i</span>
//               </div>
//               <h2 className="text-2xl font-bold mt-2">₹0</h2>
//               <p className="text-xs text-green-600 mt-1">
//                 This Month you had a profit <span className="bg-green-100 text-green-600 px-1 rounded">0%</span>
//               </p>
//             </div>

//             {/* Pending Earnings */}
//             <div className="bg-white rounded-xl shadow p-4">
//               <div className="flex justify-between items-center">
//                 <p className="text-gray-500 text-sm">Pending Earnings</p>
//                 <span className="text-gray-400 text-xs cursor-pointer">i</span>
//               </div>
//               <h2 className="text-2xl font-bold mt-2">₹0</h2>
//             </div>
//           </div>

//           {/* Revenue */}
//           <div className="bg-white rounded-xl shadow p-4">
//             <p className="font-semibold mb-2">Revenue</p>
//             <div className="h-64 flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
//               Chart Here
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Transactions */}
//         <div className="bg-white rounded-xl shadow p-4">
//           <p className="font-semibold mb-3">Transactions</p>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="text-gray-500 text-left border-b">
//                   <th className="py-2">Activity</th>
//                   <th className="py-2">Date</th>
//                   <th className="py-2">Status</th>
//                   <th className="py-2">Amount</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td colSpan="4" className="text-center py-6 text-gray-500">
//                     No transactions as of now
//                     <p className="text-xs text-gray-400">
//                       Your transaction history will appear here
//                     </p>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
