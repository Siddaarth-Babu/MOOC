
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/data_analyst/Navbar'
import Footer from '../../components/data_analyst/Footer'

const API_BASE = 'http://127.0.0.1:8000'

const Analytics = () => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      navigate('/login')
      return
    }

    let mounted = true
    setLoading(true)
    setError('')

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    fetch(`${API_BASE}/analyst/home/`, {
      method: 'GET',
      headers
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch analytics')
        }
        return res.json()
      })
      .then((data) => {
        if (!mounted) return
        setData(data)
      })
      .catch((err) => {
        if (!mounted) return
        console.error(err)
        setError(err.message || 'Failed to load analytics')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [navigate])

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px' }}>Loading analytics...</div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '50px', color: '#d32f2f' }}>
          Error: {error}
        </div>
        <Footer />
      </div>
    )
  }

  const summary = data?.summary || {}
  const charts = data?.charts || {}
  const revenueData = charts.revenue_data || []
  const gradeData = charts.grade_data || []
  const countryData = charts.country_data || []

  return (
    <div>
      <Navbar />
      <div style={{ minHeight: '70vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Analytics Dashboard</h1>
        <p style={{ color: '#666' }}>Comprehensive platform analytics and insights</p>

        {/* Tabs */}
        <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'overview' ? '#3b82f6' : 'transparent',
              color: activeTab === 'overview' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'revenue' ? '#3b82f6' : 'transparent',
              color: activeTab === 'revenue' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'grades' ? '#3b82f6' : 'transparent',
              color: activeTab === 'grades' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Grades
          </button>
          <button
            onClick={() => setActiveTab('countries')}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === 'countries' ? '#3b82f6' : 'transparent',
              color: activeTab === 'countries' ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Countries
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>Total Revenue</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                  ${summary.total_revenue?.toLocaleString() || '0'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>From all courses</div>
              </div>

              <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>Total Enrollments</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                  {summary.total_enrollments?.toLocaleString() || '0'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Student registrations</div>
              </div>

              <div style={{
                backgroundColor: '#fff',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>Avg Revenue/Course</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
                  ${revenueData.length > 0 ? (summary.total_revenue / revenueData.length).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'}
                </div>
                <div style={{ fontSize: '12px', color: '#999' }}>Average across courses</div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              marginBottom: '30px'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Summary Statistics</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Courses Offered
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {revenueData.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Grade Categories
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {gradeData.length}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Countries
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                    {countryData.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '30px' }}>Revenue by Course</h3>
            {revenueData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {revenueData.map((course, idx) => {
                  const maxRevenue = Math.max(...revenueData.map(c => c.value || 0))
                  const percentage = (course.value / maxRevenue) * 100
                  return (
                    <div key={idx}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                            {course.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            ${course.value?.toLocaleString() || '0'}
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '30px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#10b981',
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '8px'
                        }}>
                          {percentage > 10 && (
                            <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>No revenue data available</p>
            )}
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '30px' }}>Grade Distribution</h3>
            {gradeData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {gradeData.map((grade, idx) => {
                  const maxCount = Math.max(...gradeData.map(g => g.count || 0))
                  const percentage = (grade.count / maxCount) * 100
                  return (
                    <div key={idx}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                            Grade {grade.grade}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {grade.count?.toLocaleString() || '0'} students
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b' }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '30px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#f59e0b',
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '8px'
                        }}>
                          {percentage > 10 && (
                            <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>No grade data available</p>
            )}
          </div>
        )}

        {/* Countries Tab */}
        {activeTab === 'countries' && (
          <div style={{
            backgroundColor: '#fff',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '30px' }}>Enrollments by Country</h3>
            {countryData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {countryData.map((country, idx) => {
                  const maxCount = Math.max(...countryData.map(c => c.count || 0))
                  const percentage = (country.count / maxCount) * 100
                  return (
                    <div key={idx}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>
                            {country.country || 'Unknown'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999' }}>
                            {country.count?.toLocaleString() || '0'} students
                          </div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '30px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: '#3b82f6',
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '8px'
                        }}>
                          {percentage > 10 && (
                            <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>No country data available</p>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Analytics