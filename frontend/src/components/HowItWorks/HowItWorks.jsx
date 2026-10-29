import React from 'react'
import './HowItWorks.css'
import { FaRegLightbulb, FaEdit, FaShareAlt, FaChartBar } from "react-icons/fa";

const HowItWorks = () => {


    const steps = [
    {
      icon: <FaEdit />,
      title: "Create Your Poll",
      desc: "Write your question, add options, choose anonymity, and publish your poll.",
    },
    {
      icon: <FaShareAlt />,
      title: "Share with People",
      desc: "Copy the unique link and share it anywhere — WhatsApp, Instagram, Email, or SMS.",
    },
    {
      icon: <FaRegLightbulb />,
      title: "Collect Honest Votes",
      desc: "Your audience votes anonymously or with login based on your settings.",
    },
    {
      icon: <FaChartBar />,
      title: "See Live Results",
      desc: "Watch real-time vote updates powered by Socket.io with smooth live animations.",
    },
  ];


  return (
    <section className='howItWorks  container'>
      <h2 className='how-heading'>How  It Works</h2>
      <p className='how-subheading'>
        Create polls in seconds and get instant, real, and anonymous feedback.
      </p>

      <div className="how-grid">
        {steps.map((step, index) => (
            <div key={index} className="how-cards">
                <div className="how-icon">{step.icon}</div>
                <h3 className='how-title'>{step.title}</h3>
                <p className='how-desc'>{step.desc}</p>

                <div className="how-number">0{index + 1}</div>
            </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
