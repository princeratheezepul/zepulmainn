"use client"

import { useState, useEffect } from "react"

export default function CandidateStatusChart() {
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState([
    { label: "Selected", value: 0, color: "#2563eb", percentage: "0%" },
    { label: "Rejected", value: 0, color: "#1e293b", percentage: "0%" },
    { label: "Red Flag", value: 0, color: "#64748b", percentage: "0%" },
  ])

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies()
  }, [])

  // Update chart data when selected company changes
  useEffect(() => {
    if (selectedCompany) {
      updateChartData(selectedCompany)
    }
  }, [selectedCompany])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))
      
      if (!userInfo?.data?.accessToken) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-companies`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Companies API response:', result)
        if (result.success && result.companies) {
          setCompanies(result.companies)
          // Set first company as default selection
          if (result.companies.length > 0) {
            setSelectedCompany(result.companies[0])
          }
        }
      } else {
        console.error('Failed to fetch companies')
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateChartData = (company) => {
    try {
      console.log('Updating chart data for company:', company)
      
      // Update status data with real company data
      const selectedCount = company.selectedCandidatesCount || 0
      const rejectedCount = company.rejectedCandidatesCount || 0
      const redFlagCount = company.redFlagCount || 0
      const total = selectedCount + rejectedCount + redFlagCount

      console.log('Company stats:', { selectedCount, rejectedCount, redFlagCount, total })

      const newStatusData = [
        { 
          label: "Selected", 
          value: selectedCount, 
          color: "#2563eb", 
          percentage: total > 0 ? `${Math.round((selectedCount / total) * 100)}%` : "0%" 
        },
        { 
          label: "Rejected", 
          value: rejectedCount, 
          color: "#1e293b", 
          percentage: total > 0 ? `${Math.round((rejectedCount / total) * 100)}%` : "0%" 
        },
        { 
          label: "Red Flag", 
          value: redFlagCount, 
          color: "#64748b", 
          percentage: total > 0 ? `${Math.round((redFlagCount / total) * 100)}%` : "0%" 
        },
      ]
      
      setStatusData(newStatusData)
    } catch (error) {
      console.error('Error updating chart data:', error)
    }
  }

  // Calculate pie chart segments
  const total = statusData.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  const pieSegments = statusData.map((item) => {
    const percentage = (item.value / total) * 100
    const startAngle = (cumulativePercentage / 100) * 360
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360
    cumulativePercentage += percentage

    // Convert angles to radians
    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)

    // Calculate path coordinates
    const radius = 120
    const centerX = 150
    const centerY = 150

    const x1 = centerX + radius * Math.cos(startAngleRad)
    const y1 = centerY + radius * Math.sin(startAngleRad)
    const x2 = centerX + radius * Math.cos(endAngleRad)
    const y2 = centerY + radius * Math.sin(endAngleRad)

    const largeArcFlag = percentage > 50 ? 1 : 0

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ")

    return {
      ...item,
      pathData,
      percentage: Math.round(percentage),
    }
  })

  return (
    <div
      style={{
        // backgroundColor: "#ffffff",
        // borderRadius: "24px",
        // padding: "32px",
        // boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        // maxWidth: "800px",
        // width: "100%",
        // fontFamily: "system-ui, -apple-system, sans-serif",
      }}
      className="bg-white rounded-lg border border-gray-200 px-4 py-4 shadow-sm"
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div
          className="text-md font-bold text-gray-900 mr-4"
        >
          Candidate Status Breakdown
        </div>

        {/* Company Dropdown */}
        <div style={{ position: "relative" }}>
          <button className="px-4 py-1 bg-white shadow-sm border"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px", 
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "500",
              color: loading ? "#9ca3af" : "#374151",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              outline: "none",
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "#d1d5db"
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.borderColor = "#e5e7eb"
              }
            }}
          >
            {loading ? "Loading..." : (selectedCompany?.companyName || "Select Company")}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>

          {isDropdownOpen && !loading && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: "0",
                marginTop: "4px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                zIndex: 10,
                minWidth: "200px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {companies.map((company, index) => (
                <button
                  key={company._id}
                  onClick={() => {
                    setSelectedCompany(company)
                    setIsDropdownOpen(false)
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 18px",
                    textAlign: "left",
                    backgroundColor: company._id === selectedCompany?._id ? "#f3f4f6" : "transparent",
                    border: "none",
                    fontSize: "16px",
                    color: "#374151",
                    cursor: "pointer",
                    borderRadius:
                      index === 0
                        ? "12px 12px 0 0"
                        : index === companies.length - 1
                        ? "0 0 12px 12px"
                        : "0",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (company._id !== selectedCompany?._id) {
                      e.currentTarget.style.backgroundColor = "#f9fafb"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (company._id !== selectedCompany?._id) {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  {company.companyName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "60px",
        }}
      >
        {loading ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: "100%", 
            height: "300px",
            fontSize: "18px",
            color: "#6b7280"
          }}>
            Loading company data...
          </div>
        ) : total === 0 ? (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            width: "100%", 
            height: "300px",
            fontSize: "18px",
            color: "#6b7280"
          }}>
            No candidate data available for {selectedCompany?.companyName || "selected company"}
          </div>
        ) : (
          <>
            {/* Pie Chart */}
            <div style={{ flexShrink: 0 }}>
              <svg width="300" height="300" viewBox="0 0 300 300" style={{ transform: "rotate(-90deg)" }}>
                {pieSegments.map((segment) => (
                  <path
                    key={segment.label}
                    d={segment.pathData}
                    fill={segment.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    style={{
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)"
                      e.currentTarget.style.transformOrigin = "150px 150px"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)"
                    }}
                  />
                ))}
              </svg>
            </div>

            {/* Legend */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                flex: 1,
              }}
            >
              {statusData.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: item.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <div
                    style={{
                      backgroundColor: item.color,
                      color: "#ffffff",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontSize: "16px",
                      fontWeight: "600",
                      minWidth: "60px",
                      textAlign: "center",
                    }}
                  >
                    {item.percentage}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
