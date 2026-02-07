import React from 'react'
import Header from './Header.jsx'
import Hero from './Hero.jsx'
import Features from './Features.jsx'
import Roles from './Roles.jsx'
import Footer from './Footer.jsx'

const Home = () => {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <Features />
        <Roles />
      </main>
      <Footer />
    </div>
  )
}

export default Home
