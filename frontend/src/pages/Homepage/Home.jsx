import React from 'react'
import Header from './Header.jsx'
import Hero from './Hero.jsx'
import Features from './Features.jsx'
import Roles from './Roles.jsx'
import Footer from './Footer.jsx'
import { useEffect, useState } from 'react'

const Home = () => {
  const [universities, setUniversities] = useState([])

  useEffect(() => {
    let mounted = true
    fetch('http://127.0.0.1:8000/universities')
      .then(async (res) => {
        if (!res.ok) return []
        const j = await res.json()
        return j.universities || []
      })
      .then((list) => { if (mounted) setUniversities(list) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])
  return (
    <div>
      <Header />
      <main>
        <Hero />
        {universities && universities.length > 0 && (
          <section className="universities-strip" style={{padding:'1rem 0', background:'#fff'}}>
            <div className="container">
              <h3 className="section-title">Partner Universities</h3>
              <div style={{display:'flex',gap:12,overflowX:'auto',padding:'0.5rem 0'}}>
                {universities.map(u => (
                  <div key={u.institute_id} style={{minWidth:200,flex:'0 0 auto',border:'1px solid #eef2f7',padding:12,borderRadius:8,background:'#fff'}}>
                    <strong>{u.name}</strong>
                    <div className="muted">{u.city}, {u.country}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        <Features />
        <Roles />
      </main>
      <Footer />
    </div>
  )
}

export default Home
