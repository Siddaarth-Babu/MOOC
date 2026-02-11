import React, { useState } from 'react'

const Statistics = ({
  totalRevenue = 0,
  totalEnrollments = 0,
  avgRevenuePerCourse = 0,
  revenueData = [],
  gradeData = [],
  countryData = []
}) => {
  const [activeChart, setActiveChart] = useState('revenue')

  // Get top revenue course
  const topRevenueCourse = revenueData.length > 0 
    ? revenueData.reduce((prev, current) => 
        (prev.value || 0) > (current.value || 0) ? prev : current
      )
    : null

  // Get top enrollment country
  const topCountry = countryData.length > 0
    ? countryData.reduce((prev, current) =>
        (prev.count || 0) > (current.count || 0) ? prev : current
      )
    : null

  // Get most common grade
  const topGrade = gradeData.length > 0
    ? gradeData.reduce((prev, current) =>
        (prev.count || 0) > (current.count || 0) ? prev : current
      )
    : null

  return (
    <div className="analyst-dashboard">
      {/* Key Metrics Row */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Total Revenue */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
            ${totalRevenue.toLocaleString()}
          </div>
        </div>

        {/* Total Enrollments */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Enrollments</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
            {totalEnrollments.toLocaleString()}
          </div>
        </div>

        {/* Average Revenue Per Course */}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Avg Revenue/Course</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#8b5cf6' }}>
            ${avgRevenuePerCourse.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Top Insights Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Top Revenue Course */}
        {topRevenueCourse && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px', textTransform: 'uppercase' }}>
              Top Revenue Course
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {topRevenueCourse.name}
            </div>
            <div style={{ fontSize: '16px', color: '#10b981', fontWeight: 'bold' }}>
              ${topRevenueCourse.value?.toLocaleString()}
            </div>
          </div>
        )}

        {/* Top Enrollment Country */}
        {topCountry && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px', textTransform: 'uppercase' }}>
              Top Enrollment Country
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {topCountry.country || 'N/A'}
            </div>
            <div style={{ fontSize: '16px', color: '#3b82f6', fontWeight: 'bold' }}>
              {topCountry.count?.toLocaleString()} students
            </div>
          </div>
        )}

        {/* Most Common Grade */}
        {topGrade && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px', textTransform: 'uppercase' }}>
              Most Common Grade
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
              {topGrade.grade || 'N/A'}
            </div>
            <div style={{ fontSize: '16px', color: '#f59e0b', fontWeight: 'bold' }}>
              {topGrade.count?.toLocaleString()} students
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveChart('revenue')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeChart === 'revenue' ? '#3b82f6' : '#e5e7eb',
                color: activeChart === 'revenue' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Revenue by Course
            </button>
            <button
              onClick={() => setActiveChart('grades')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeChart === 'grades' ? '#3b82f6' : '#e5e7eb',
                color: activeChart === 'grades' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Grade Distribution
            </button>
            <button
              onClick={() => setActiveChart('countries')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeChart === 'countries' ? '#3b82f6' : '#e5e7eb',
                color: activeChart === 'countries' ? 'white' : '#374151',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Enrollments by Country
            </button>
          </div>

          {/* Revenue Chart */}
          {activeChart === 'revenue' && revenueData.length > 0 && (
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Revenue by Course</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {revenueData.map((item, idx) => {
                  const maxValue = Math.max(...revenueData.map(d => d.value || 0))
                  const percentage = (item.value / maxValue) * 100
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{item.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                          ${item.value?.toLocaleString()}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '24px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#10b981',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grade Distribution Chart */}
          {activeChart === 'grades' && gradeData.length > 0 && (
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Grade Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {gradeData.map((item, idx) => {
                  const maxCount = Math.max(...gradeData.map(d => d.count || 0))
                  const percentage = (item.count / maxCount) * 100
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>Grade {item.grade}</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b' }}>
                          {item.count?.toLocaleString()} students
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '24px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#f59e0b',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Country Distribution Chart */}
          {activeChart === 'countries' && countryData.length > 0 && (
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>Enrollments by Country</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {countryData.map((item, idx) => {
                  const maxCount = Math.max(...countryData.map(d => d.count || 0))
                  const percentage = (item.count / maxCount) * 100
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>{item.country}</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>
                          {item.count?.toLocaleString()} students
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '24px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Statistics