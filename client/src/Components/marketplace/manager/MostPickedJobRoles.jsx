
import { useState, useEffect } from "react"

export default function JobRolesChart() {
  const [selectedCompany, setSelectedCompany] = useState("All Companies")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [jobRoles, setJobRoles] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchJobRolesData()
  }, [])

  const fetchJobRolesData = async (companyName = null) => {
    try {
      setLoading(true)
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))
      
      if (!userInfo?.data?.accessToken) {
        throw new Error('No authentication token found')
      }

      // Build URL with company parameter if provided
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-job-roles`
      if (companyName && companyName !== 'All Companies') {
        url += `?companyName=${encodeURIComponent(companyName)}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setJobRoles(data.data.jobRoles)
          setCompanies(['All Companies', ...data.data.companies])
        } else {
          throw new Error(data.message || 'Failed to fetch job roles data')
        }
      } else {
        throw new Error('Failed to fetch job roles data')
      }
    } catch (error) {
      console.error('Error fetching job roles data:', error)
      setError(error.message)
      // Set fallback data
      setJobRoles([
        { name: "No Data Available", percentage: 0, color: "#6b7280" }
      ])
      setCompanies(["All Companies"])
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyChange = (companyName) => {
    setSelectedCompany(companyName)
    setIsDropdownOpen(false)
    fetchJobRolesData(companyName)
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        padding: "32px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
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
        <div className="text-2xl font-bold text-gray-900 mr-4">
         
        
          Most Picked Job Roles
        </div>

        {/* Custom Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "16px",
              fontWeight: "500",
              color: "#374151",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: "200px",
              justifyContent: "space-between",
            }}
          >
            {selectedCompany}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </button>

          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "0",
                right: "0",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                marginTop: "4px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                zIndex: 10,
              }}
            >
              {companies.map((company) => (
                <button
                  key={company}
                  onClick={() => handleCompanyChange(company)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    textAlign: "left",
                    backgroundColor: company === selectedCompany ? "#f3f4f6" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#374151",
                    borderRadius:
                      company === companies[0]
                        ? "12px 12px 0 0"
                        : company === companies[companies.length - 1]
                        ? "0 0 12px 12px"
                        : "0",
                  }}
                  onMouseEnter={(e) => {
                    if (company !== selectedCompany) {
                      e.target.style.backgroundColor = "#f9fafb"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (company !== selectedCompany) {
                      e.target.style.backgroundColor = "transparent"
                    }
                  }}
                >
                  {company}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {loading ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "200px",
            fontSize: "16px",
            color: "#6b7280"
          }}>
            Loading job roles data...
          </div>
        ) : error ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "200px",
            fontSize: "16px",
            color: "#ef4444"
          }}>
            Error: {error}
          </div>
        ) : jobRoles.length === 0 ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "200px",
            fontSize: "16px",
            color: "#6b7280"
          }}>
            {selectedCompany === 'All Companies' ? 'No job roles data available' : `No job roles data available for ${selectedCompany}`}
          </div>
        ) : (
          jobRoles.map((role, index) => (
            <div
              key={role.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              {/* Role Name */}
              <div
                style={{
                  minWidth: "180px",
                  textAlign: "right",
                  fontSize: "16px",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                {role.name}
              </div>

              {/* Progress Bar Container */}
              <div
                style={{
                  flex: "1",
                  height: "32px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "6px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Progress Bar Fill */}
                <div
                  style={{
                    height: "100%",
                    backgroundColor: role.color,
                    width: `${role.percentage}%`,
                    borderRadius: "6px",
                    transition: "width 0.8s ease-out",
                    animation: `fillBar${index} 0.8s ease-out`,
                  }}
                />
              </div>

              {/* Percentage */}
              <div
                style={{
                  minWidth: "50px",
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                {role.percentage}%
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inline CSS for animations */}
      <style jsx>{`
        ${jobRoles.map((role, index) => `
          @keyframes fillBar${index} {
            from { width: 0%; }
            to { width: ${role.percentage}%; }
          }
        `).join('')}
      `}</style>
    </div>
  )
}
6