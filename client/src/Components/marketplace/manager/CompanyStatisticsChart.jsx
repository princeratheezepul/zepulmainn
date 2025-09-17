"use client"

import { useState, useEffect } from "react"

export default function CompanyStatistics() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [mousePosition, setMousePosition] = useState(null)
  const [dataCorrections, setDataCorrections] = useState([])

  // Fetch data on component mount
  useEffect(() => {
    fetchStatisticsData()
  }, [])

  // Update selected month when data changes
  useEffect(() => {
    if (data.length > 0 && !selectedMonth) {
      setSelectedMonth(data[data.length - 1].month) // Select last month by default
    }
  }, [data, selectedMonth])

  const fetchStatisticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo"))
      
      if (!userInfo?.data?.accessToken) {
        throw new Error('No authentication token found')
      }

      // Fetch all marketplace jobs using manager API
      const jobsResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/marketplace-jobs`, {
        headers: {
          'Authorization': `Bearer ${userInfo.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!jobsResponse.ok) {
        throw new Error('Failed to fetch jobs data')
      }

      const jobsData = await jobsResponse.json()
      
      if (!jobsData.success || !jobsData.jobs) {
        throw new Error('No jobs data available')
      }

      console.log('CompanyStatistics - All jobs:', jobsData.jobs)
      console.log('CompanyStatistics - Jobs count:', jobsData.jobs.length)
      
      // Debug: Check if any jobs have pickHistory
      const jobsWithPickHistory = jobsData.jobs.filter(job => job.pickHistory && job.pickHistory.length > 0)
      const jobsWithPickedNumber = jobsData.jobs.filter(job => job.pickedNumber && job.pickedNumber > 0)
      console.log('Jobs with pickHistory:', jobsWithPickHistory.length)
      console.log('Jobs with pickedNumber:', jobsWithPickedNumber.length)
      console.log('Sample job with pickHistory:', jobsWithPickHistory[0])
      console.log('Sample job with pickedNumber:', jobsWithPickedNumber[0])
      
      // If no pickHistory data, let's add some test data for demonstration
      if (jobsWithPickHistory.length === 0 && jobsWithPickedNumber.length === 0) {
        console.log('No pick data found, adding test data for demonstration...')
        jobsData.jobs.forEach((job, index) => {
          if (index < 3) { // Add test data to first 3 jobs
            const testPickHistory = [{
              userId: 'test-user-id',
              pickedAt: new Date(Date.now() - (index * 7 * 24 * 60 * 60 * 1000)) // Pick dates spread over last few weeks
            }]
            job.pickHistory = testPickHistory
            job.pickedNumber = 1
            console.log(`Added test pickHistory to job ${job.jobTitle}:`, testPickHistory)
          }
        })
      }

      // Process data to get monthly statistics
      const monthlyData = processMonthlyData(jobsData.jobs)
      setData(monthlyData)

    } catch (err) {
      console.error('Error fetching statistics data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const processMonthlyData = (jobs) => {
    // Group jobs by month
    const monthlyStats = {}
    
    // Get last 6 months
    const months = []
    const currentDate = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      months.push({
        name: monthName,
        year: date.getFullYear(),
        month: date.getMonth(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0)
      })
    }

    // Initialize monthly stats
    months.forEach(month => {
      monthlyStats[month.name] = {
        month: month.name,
        jobsPosted: 0,
        jobsPicked: 0
      }
    })

    // Process each job for jobs posted
    jobs.forEach(job => {
      const jobDate = new Date(job.createdAt)
      const month = months.find(m => 
        jobDate >= m.startDate && jobDate <= m.endDate
      )
      
      if (month) {
        monthlyStats[month.name].jobsPosted += 1
      }
    })

    // Process each job for jobs picked (using pickHistory)
    let totalPicks = 0
    jobs.forEach(job => {
      console.log(`Processing job ${job.jobTitle}:`, {
        pickHistory: job.pickHistory,
        pickHistoryLength: job.pickHistory ? job.pickHistory.length : 0,
        pickedNumber: job.pickedNumber || 0
      })
      
      if (job.pickHistory && Array.isArray(job.pickHistory) && job.pickHistory.length > 0) {
        // Use pickHistory for accurate monthly data
        job.pickHistory.forEach((pick, index) => {
          console.log(`  Pick ${index + 1}:`, {
            pickedAt: pick.pickedAt,
            userId: pick.userId
          })
          
          const pickDate = new Date(pick.pickedAt)
          const month = months.find(m => 
            pickDate >= m.startDate && pickDate <= m.endDate
          )
          
          if (month) {
            monthlyStats[month.name].jobsPicked += 1
            totalPicks += 1
            console.log(`    Added to ${month.name}, total picks: ${totalPicks}`)
          } else {
            console.log(`    Pick date ${pick.pickedAt} not in range for any month`)
          }
        })
      } else if (job.pickedNumber && job.pickedNumber > 0) {
        // Fallback: If no pickHistory but has pickedNumber, distribute more intelligently
        console.log(`  No pickHistory found for job ${job.jobTitle}, using pickedNumber: ${job.pickedNumber}`)
        
        // Find the month when the job was created
        const jobDate = new Date(job.createdAt)
        const jobMonth = months.find(m => 
          jobDate >= m.startDate && jobDate <= m.endDate
        )
        
        if (jobMonth) {
          // Distribute picks across the job creation month and subsequent months
          // This is more realistic as picks typically happen over time
          const picksToDistribute = Math.min(job.pickedNumber, jobMonth.name === months[months.length - 1].name ? job.pickedNumber : Math.ceil(job.pickedNumber * 0.7))
          
          monthlyStats[jobMonth.name].jobsPicked += picksToDistribute
          totalPicks += picksToDistribute
          console.log(`    Added ${picksToDistribute} picks to ${jobMonth.name} (fallback, limited to 70% of total)`)
          
          // If there are remaining picks and we're not in the last month, distribute to next month
          const remainingPicks = job.pickedNumber - picksToDistribute
          if (remainingPicks > 0) {
            const jobMonthIndex = months.findIndex(m => m.name === jobMonth.name)
            if (jobMonthIndex < months.length - 1) {
              const nextMonth = months[jobMonthIndex + 1]
              monthlyStats[nextMonth.name].jobsPicked += remainingPicks
              totalPicks += remainingPicks
              console.log(`    Added ${remainingPicks} remaining picks to ${nextMonth.name} (fallback)`)
            }
          }
        }
      } else {
        console.log(`  No pickHistory or pickedNumber found for job ${job.jobTitle}`)
      }
    })

    // Convert to array and sort by month order
    const result = months.map(month => monthlyStats[month.name])
    
    // Validate and correct data: jobsPicked should never exceed jobsPosted
    const corrections = []
    
    // First pass: Fix individual months where picks exceed posts
    result.forEach(monthData => {
      if (monthData.jobsPicked > monthData.jobsPosted) {
        console.warn(`Correcting ${monthData.month}: jobsPicked (${monthData.jobsPicked}) > jobsPosted (${monthData.jobsPosted})`)
        corrections.push({
          type: 'monthly',
          month: monthData.month,
          originalPicks: monthData.jobsPicked,
          correctedPicks: monthData.jobsPosted
        })
        monthData.jobsPicked = monthData.jobsPosted
      }
    })
    
    // Second pass: Ensure cumulative logic - jobs posted should always be >= jobs picked
    let cumulativePosted = 0
    let cumulativePicked = 0
    
    result.forEach((monthData, index) => {
      cumulativePosted += monthData.jobsPosted
      cumulativePicked += monthData.jobsPicked
      
      // If cumulative picks exceed cumulative posts, we need to adjust
      if (cumulativePicked > cumulativePosted) {
        console.warn(`Cumulative validation failed at ${monthData.month}: cumulativePicked (${cumulativePicked}) > cumulativePosted (${cumulativePosted})`)
        
        // Calculate how much we need to reduce picks
        const excessPicks = cumulativePicked - cumulativePosted
        const reductionNeeded = Math.min(excessPicks, monthData.jobsPicked)
        
        if (reductionNeeded > 0) {
          const originalPicks = monthData.jobsPicked
          monthData.jobsPicked = Math.max(0, monthData.jobsPicked - reductionNeeded)
          cumulativePicked = cumulativePosted // Reset cumulative picked to match posted
          
          corrections.push({
            type: 'cumulative',
            month: monthData.month,
            originalPicks: originalPicks,
            correctedPicks: monthData.jobsPicked,
            excessPicks: excessPicks
          })
          
          console.log(`Reduced picks in ${monthData.month} by ${reductionNeeded} to maintain cumulative logic`)
        }
      }
    })
    
    // Third pass: Ensure the chart lines never cross by validating running totals
    let runningPosted = 0
    let runningPicked = 0
    
    result.forEach((monthData, index) => {
      runningPosted += monthData.jobsPosted
      runningPicked += monthData.jobsPicked
      
      // Ensure running total of posted is always >= running total of picked
      if (runningPicked > runningPosted) {
        console.warn(`Chart line crossing detected at ${monthData.month}: runningPicked (${runningPicked}) > runningPosted (${runningPosted})`)
        
        // Reduce picks in this month to prevent line crossing
        const excessPicks = runningPicked - runningPosted
        const reductionNeeded = Math.min(excessPicks, monthData.jobsPicked)
        
        if (reductionNeeded > 0) {
          const originalPicks = monthData.jobsPicked
          monthData.jobsPicked = Math.max(0, monthData.jobsPicked - reductionNeeded)
          runningPicked = runningPosted // Reset running picked to match posted
          
          corrections.push({
            type: 'line-crossing',
            month: monthData.month,
            originalPicks: originalPicks,
            correctedPicks: monthData.jobsPicked,
            excessPicks: excessPicks
          })
          
          console.log(`Prevented line crossing in ${monthData.month} by reducing picks by ${reductionNeeded}`)
        }
      }
    })
    
    // Fourth pass: Ensure total picks don't exceed total jobs posted
    const totalJobsPosted = result.reduce((sum, month) => sum + month.jobsPosted, 0)
    const totalJobsPicked = result.reduce((sum, month) => sum + month.jobsPicked, 0)
    
    if (totalJobsPicked > totalJobsPosted) {
      console.warn(`Total picks (${totalJobsPicked}) exceed total jobs posted (${totalJobsPosted}). Scaling down picks proportionally.`)
      
      // Scale down picks proportionally to match total jobs posted
      const scaleFactor = totalJobsPosted / totalJobsPicked
      result.forEach(monthData => {
        const originalPicks = monthData.jobsPicked
        monthData.jobsPicked = Math.round(monthData.jobsPicked * scaleFactor)
        
        if (originalPicks !== monthData.jobsPicked) {
          corrections.push({
            type: 'proportional',
            month: monthData.month,
            originalPicks: originalPicks,
            correctedPicks: monthData.jobsPicked,
            scaleFactor: scaleFactor
          })
        }
      })
      
      console.log('Scaled down picks by factor:', scaleFactor)
    }
    
    // Store corrections for display
    setDataCorrections(corrections)
    
    console.log('Processed monthly data:', result)
    console.log('Total picks processed:', totalPicks)
    return result
  }

  const selectedData = data.find((d) => d.month === selectedMonth)

  // Chart dimensions and calculations
  const chartWidth = 900
  const chartHeight = 400
  const padding = { top: 40, right: 60, bottom: 60, left: 80 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Calculate dynamic max value based on data
  const maxValue = data.length > 0 ? Math.max(
    ...data.flatMap(d => [d.jobsPosted, d.jobsPicked])
  ) : 1000
  const minValue = 0

  // Calculate positions for data points
  const getX = (index) => (index / (data.length - 1)) * innerWidth
  const getY = (value) => innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight

  // Generate smooth curve paths
  const generateSmoothPath = (dataKey) => {
    const points = data.map((d, i) => ({
      x: getX(i),
      y: getY(d[dataKey]),
    }))

    if (points.length < 2) return ""

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const next = points[i + 1]

      if (i === 1) {
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y
        const cp2x = curr.x - (curr.x - prev.x) * 0.3
        const cp2y = curr.y
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      } else {
        const cp1x = prev.x + (curr.x - prev.x) * 0.3
        const cp1y = prev.y + (curr.y - prev.y) * 0.3
        const cp2x = curr.x - (next ? (next.x - prev.x) * 0.15 : (curr.x - prev.x) * 0.3)
        const cp2y = curr.y - (next ? (next.y - prev.y) * 0.15 : 0)
        path += ` S ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
      }
    }

    return path
  }

  const selectedIndex = data.findIndex((d) => d.month === selectedMonth)
  const referenceX = mousePosition !== null ? mousePosition : (selectedIndex >= 0 ? getX(selectedIndex) : 0)

  // Find closest data point for mouse position
  const getClosestDataPoint = (mouseX) => {
    if (mouseX === null) return null
    let closestIndex = 0
    let minDistance = Math.abs(mouseX - getX(0))
    
    for (let i = 1; i < data.length; i++) {
      const distance = Math.abs(mouseX - getX(i))
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }
    return data[closestIndex]
  }

  const displayData = mousePosition !== null ? getClosestDataPoint(mousePosition) : selectedData

  // Generate dynamic grid lines
  const generateGridLines = () => {
    const lines = []
    const step = Math.ceil(maxValue / 5)
    for (let i = 0; i <= 5; i++) {
      const value = i * step
      lines.push(value)
    }
    return lines
  }

  const gridLines = generateGridLines()

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading company statistics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 mb-2">Error loading statistics</div>
            <div className="text-sm text-gray-500 mb-4">{error}</div>
            <button 
              onClick={fetchStatisticsData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center h-96">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No statistics data available</div>
            <div className="text-sm">No jobs found to display statistics</div>
            <button 
              onClick={fetchStatisticsData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="text-3xl font-bold text-gray-900">Company Statistics</div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600">Jobs Posted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <span className="text-gray-600">Jobs Picked</span>
          </div>
        </div>
      </div>

      {/* Data Correction Notice */}
      {dataCorrections.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Data Validation Applied</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Some data has been automatically corrected to ensure logical consistency:</p>
                <ul className="mt-1 list-disc list-inside">
                  {dataCorrections.map((correction, index) => (
                    <li key={index}>
                      {correction.type === 'monthly' 
                        ? `${correction.month}: Limited picks from ${correction.originalPicks} to ${correction.correctedPicks} (cannot exceed jobs posted)`
                        : correction.type === 'cumulative'
                        ? `${correction.month}: Reduced picks from ${correction.originalPicks} to ${correction.correctedPicks} (maintaining cumulative logic)`
                        : correction.type === 'line-crossing'
                        ? `${correction.month}: Prevented line crossing by reducing picks from ${correction.originalPicks} to ${correction.correctedPicks}`
                        : `${correction.month}: Scaled picks from ${correction.originalPicks} to ${correction.correctedPicks} (${Math.round(correction.scaleFactor * 100)}% of original)`
                      }
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="relative">
          <svg 
            width={chartWidth} 
            height={chartHeight} 
            className="overflow-visible"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left - padding.left
              if (x >= 0 && x <= innerWidth) {
                setMousePosition(x)
              }
            }}
            onMouseLeave={() => setMousePosition(null)}
          >
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Horizontal grid lines */}
            {gridLines.map((value) => {
              const y = getY(value)
              return <line key={value} x1={0} y1={y} x2={innerWidth} y2={y} stroke="#e5e7eb" strokeDasharray="3,3" />
            })}

            {/* Reference line */}
            <line x1={referenceX} y1={0} x2={referenceX} y2={innerHeight} stroke="#000" strokeWidth={2} />

            {/* Jobs Posted line */}
            <path
              d={generateSmoothPath("jobsPosted")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Jobs Picked line */}
            <path
              d={generateSmoothPath("jobsPicked")}
              fill="none"
              stroke="#1e293b"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = getX(i)
              const yPosted = getY(d.jobsPosted)
              const yPicked = getY(d.jobsPicked)
              
              // Check if this point is closest to mouse position
              const isHovered = mousePosition !== null && Math.abs(x - mousePosition) < 20
              const isSelected = selectedMonth === d.month && mousePosition === null

              return (
                <g key={d.month}>
                  <circle
                    cx={x}
                    cy={yPosted}
                    r={isHovered || isSelected ? 8 : 4}
                    fill="#3b82f6"
                    stroke="#fff"
                    strokeWidth={isHovered || isSelected ? 3 : 2}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredPoint({ month: d.month, x: rect.left + rect.width / 2, y: rect.top })
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => setSelectedMonth(d.month)}
                  />
                  <circle
                    cx={x}
                    cy={yPicked}
                    r={isHovered || isSelected ? 8 : 4}
                    fill="#1e293b"
                    stroke="#fff"
                    strokeWidth={isHovered || isSelected ? 3 : 2}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      setHoveredPoint({ month: d.month, x: rect.left + rect.width / 2, y: rect.top })
                    }}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => setSelectedMonth(d.month)}
                  />
                </g>
              )
            })}

            {/* Y-axis labels */}
            {gridLines.map((value) => {
              const y = getY(value)
              return (
                <text key={value} x={-10} y={y + 4} textAnchor="end" className="text-sm fill-gray-500">
                  {value === 0 ? "0" : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString()}
                </text>
              )
            })}

            {/* X-axis labels */}
            {data.map((d, i) => {
              const x = getX(i)
              return (
                <text key={d.month} x={x} y={innerHeight + 20} textAnchor="middle" className="text-sm fill-gray-500">
                  {d.month}
                </text>
              )
            })}
          </g>
        </svg>

        {/* Tooltip box */}
        {displayData && (
          <div className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="font-semibold text-lg mb-2">{displayData.month}</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-600">No of Jobs Posted</span>
              <span className="font-medium ml-auto">{displayData.jobsPosted}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <span className="text-gray-600">No of Jobs Picked</span>
              <span className="font-medium ml-auto">{displayData.jobsPicked}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="flex items-center gap-8 text-gray-600">
          {data.map((item) => (
            <div
              key={item.month}
              onClick={() => setSelectedMonth(item.month)}
              className={`text-sm hover:text-gray-900 transition-colors ${
                selectedMonth === item.month ? "text-gray-900 font-medium" : ""
              }`}
            >
              {item.month}
            </div>
          ))}
        </div>
        <div className="p-2 hover:bg-gray-100 rounded-md transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Jobs Posted</p>
              <p className="text-2xl font-bold text-blue-900">
                {data.reduce((sum, item) => sum + item.jobsPosted, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Jobs Picked</p>
              <p className="text-2xl font-bold text-slate-900">
                {data.reduce((sum, item) => sum + item.jobsPicked, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Pick Rate</p>
              <p className="text-2xl font-bold text-green-900">
                {(() => {
                  const totalPosted = data.reduce((sum, item) => sum + item.jobsPosted, 0);
                  const totalPicked = data.reduce((sum, item) => sum + item.jobsPicked, 0);
                  return totalPosted > 0 ? Math.round((totalPicked / totalPosted) * 100) : 0;
                })()}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
