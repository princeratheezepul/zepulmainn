"use client"

import { useState } from "react"

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 28000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 32000 },
  { month: "May", revenue: 18000 },
  { month: "Jun", revenue: 42000 },
  { month: "Jul", revenue: 58000 },
]

export default function RevenueChart() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(4) // Default to May (index 4)
  const maxRevenue = 100000
  const chartHeight = 300
  const padding = { top: 40, right: 0, bottom: 60, left: 0 }

  // Calculate positions for data points
  const chartWidth = 600 // Fixed width for viewBox calculations
  const dataPoints = revenueData.map((item, index) => {
    const x = padding.left + (index * (chartWidth - padding.left - padding.right)) / (revenueData.length - 1)
    const y = padding.top + ((maxRevenue - item.revenue) / maxRevenue) * (chartHeight - padding.top - padding.bottom)
    return { x, y, ...item }
  })

  // Create smooth curve path
  const createSmoothPath = (points) => {
    if (points.length < 2) return ""

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cp1x = prev.x + (curr.x - prev.x) * 0.3
      const cp1y = prev.y
      const cp2x = curr.x - (curr.x - prev.x) * 0.3
      const cp2y = curr.y

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`
    }

    return path
  }

  const selectedPoint = dataPoints[selectedMonthIndex]

  const handleMouseMove = (event) => {
    const svg = event.currentTarget
    const rect = svg.getBoundingClientRect()
    const mouseX = ((event.clientX - rect.left) / rect.width) * 600 // Convert to viewBox coordinates

    // Find the closest data point
    let closestIndex = 0
    let minDistance = Math.abs(mouseX - dataPoints[0].x)

    for (let i = 1; i < dataPoints.length; i++) {
      const distance = Math.abs(mouseX - dataPoints[i].x)
      if (distance < minDistance) {
        minDistance = distance
        closestIndex = i
      }
    }

    setSelectedMonthIndex(closestIndex)
  }

  return (
    <div className="bg-white rounded-lg border">
      <h3 className="text-lg font-semibold text-gray-900 p-6 pb-4">Revenue</h3>

      <div className="relative w-full">
        <svg
          width="100%"
          height={chartHeight}
          viewBox="0 0 600 300"
          className="overflow-visible"
          onMouseMove={handleMouseMove}
        >
          {/* Y-axis labels */}
          {[0, 20000, 40000, 60000, 80000, 100000].map((value) => {
            const y = padding.top + ((maxRevenue - value) / maxRevenue) * (chartHeight - padding.top - padding.bottom)
            return (
              <g key={value}>
                <text x={padding.left - 5} y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                  {value === 0 ? "0" : `${value / 1000}k`}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {dataPoints.map((point, index) => (
            <g key={point.month}>
              <rect x={point.x - 20} y={chartHeight - padding.bottom} width="40" height="30" fill="transparent" />
              {/* Month label */}
              <text
                x={point.x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                className={`text-xs ${index === selectedMonthIndex ? "fill-blue-600 font-semibold" : "fill-gray-500"}`}
              >
                {point.month}
              </text>
            </g>
          ))}

          {/* Chart line */}
          <path
            d={createSmoothPath(dataPoints)}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            className="drop-shadow-sm"
          />

          {/* Selected month reference line and tooltip */}
          {selectedPoint && (
            <>
              <line
                x1={selectedPoint.x}
                y1={padding.top}
                x2={selectedPoint.x}
                y2={chartHeight - padding.bottom}
                stroke="#000"
                strokeWidth="2"
              />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="4" fill="white" stroke="#000" strokeWidth="2" />
              <g transform={`translate(${selectedPoint.x + 20}, ${selectedPoint.y - 40})`}>
                <rect
                  x="0"
                  y="0"
                  width="100"
                  height="50"
                  rx="8"
                  fill="white"
                  stroke="#e5e7eb"
                  className="drop-shadow-lg"
                />
                <text x="50" y="20" textAnchor="middle" className="text-lg font-semibold fill-blue-600">
                  ₹{selectedPoint.revenue.toLocaleString()}
                </text>
                <text x="50" y="35" textAnchor="middle" className="text-sm fill-gray-500">
                  {selectedPoint.month}
                </text>
              </g>
            </>
          )}
        </svg>
      </div>
    </div>
  )
}
