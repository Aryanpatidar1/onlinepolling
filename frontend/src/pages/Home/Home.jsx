import React from 'react'
import Hero from '../../components/Hero/Hero'
import FeaturedPolls from '../../components/FeaturedPolls/FeaturedPolls'
import HowItWorks from '../../components/HowItWorks/HowItWorks'
import Testimonials from '../../components/Testimonials/Testimonials'
import CTA from '../../components/CTA/CTA'

const Home = () => {
  return (
    <div>
      <Hero/>
      <FeaturedPolls/>
      <HowItWorks/>
      <Testimonials/>
      <CTA/>
    </div>
  )
}

export default Home
