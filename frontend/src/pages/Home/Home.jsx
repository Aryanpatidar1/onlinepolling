import React from 'react'
import Hero from '../../components/Hero/Hero'
import FeaturedPolls from '../../components/FeaturedPolls/FeaturedPolls'
import HowItWorks from '../../components/HowItWorks/HowItWorks'
import UseCases from '../../components/UseCases/UseCases'
import CTA from '../../components/CTA/CTA'

const Home = () => {
  return (
    <div>
      <Hero/>
      <FeaturedPolls/>
      <HowItWorks/>
      <UseCases/>
      <CTA/>
    </div>
  )
}

export default Home
