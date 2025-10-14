export function CommissionCard({ job }) {
    // Get commission rate from job data, default to 0 if not present
    const commissionRate = job?.commissionRate || 0;
    
    return (
      <div className="rounded-2xl p-3 flex flex-col items-center bg-white shadow-sm border border-gray-200 max-w-md">
        <div className="text-xl items-left font-bold mb-4 text-black">Commission & Payout</div>
  
        <div className="relative w-56 h-32">
          <svg className="w-56 h-32" viewBox="0 0 200 100">
            {/* Background semi-circle - gray */}
            <path 
              d="M 20 80 A 80 80 0 0 1 180 80" 
              fill="none" 
              stroke="#6B7280" 
              strokeWidth="16" 
            />
            {/* Progress arc - blue (commissionRate% of semi-circle) */}
            <path
              d="M 20 80 A 80 80 0 0 1 180 80"
              fill="none"
              stroke="#2563EB"
              strokeWidth="16"
              strokeDasharray={`${(commissionRate/100) * 251.2} 251.2`}
              strokeDashoffset="0"
            />
          </svg>
  
          {/* Center text positioned for semi-circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
            <div className="text-5xl font-bold text-black">{commissionRate}%</div>
            <div className="text-lg text-gray-500 mt-1">Revenue</div>
          </div>
        </div>
  
        <div className="text-center text-black text-base font-medium mb-2">You earn Upto {commissionRate}% for this Hire</div>
      </div>
    )
  }
  