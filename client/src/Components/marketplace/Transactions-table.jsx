export default function TransactionsTable() {
    const transactions = [
      { id: 1, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 2, activity: "PQR Tech Ltd.", date: "08-05-25", status: "Deducted", amount: "-₹41,216" },
      { id: 3, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Withdrawn", amount: "-₹41,216" },
      { id: 4, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 5, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 6, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 7, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Withdrawn", amount: "-₹41,216" },
      { id: 8, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 9, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Withdrawn", amount: "-₹41,216" },
      { id: 10, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 11, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Deducted", amount: "-₹41,216" },
      { id: 12, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Received", amount: "₹41,216" },
      { id: 13, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Deducted", amount: "-₹41,216" },
      { id: 14, activity: "ABC Tech Ltd.", date: "08-05-25", status: "Withdrawn", amount: "-₹41,216" },
    ];
  
    const getStatusBadgeColor = (status) => {
      switch (status) {
        case "Received":
          return "bg-green-100 text-green-800";
        case "Deducted":
          return "bg-red-100 text-red-800";
        case "Withdrawn":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  
    return (
      <div className="bg-white rounded-lg border p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Transactions</h3>
  
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 pb-3 mb-4 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-600">Activity</div>
          <div className="text-sm font-medium text-gray-600">Date</div>
          <div className="text-sm font-medium text-gray-600">Status</div>
          <div className="text-sm font-medium text-gray-600">Amount</div>
        </div>
  
        {/* Table Rows */}
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="grid grid-cols-4 gap-4 items-center">
              <div className="text-sm font-medium text-gray-900">{transaction.activity}</div>
              <div className="text-sm text-gray-600">{transaction.date}</div>
              <div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900">{transaction.amount}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  