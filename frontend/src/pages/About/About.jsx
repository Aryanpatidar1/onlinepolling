import React from "react";
import "./About.css";
import { FaPoll } from "react-icons/fa";

const About = () => {
  return (
    <main className="about-page container">

      {/* HERO */}
      <section className="about-hero">
        <FaPoll className="about-icon" />
        <h1>About PrimePoll</h1>
        <p className="about-subtitle">
          PrimePoll is a modern online polling platform that helps people share
          opinions quickly, securely, and transparently.
        </p>
      </section>

      {/* MAIN ABOUT CONTENT */}
      <section className="about-content">
        <p>
          PrimePoll was built with a simple idea — to make online polling fast,
          accessible, and reliable for everyone. Whether you want to collect
          public opinions, get team feedback, or just ask fun questions,
          PrimePoll gives you a clean and powerful platform to do it with ease.
        </p>

        <p>
          Unlike traditional polling tools, PrimePoll focuses on real-time
          interaction. Every vote updates instantly, giving users a transparent
          view of how opinions change over time. Our goal is to make the polling
          experience seamless and enjoyable for both creators and voters.
        </p>

        <p>
          We believe that honest opinions matter. That’s why PrimePoll includes
          anonymous voting options, secure authentication, and modern UI
          designed for clarity and trust. Whether you're a student, creator,
          business, or community leader — PrimePoll helps you gather meaningful
          insights effortlessly.
        </p>
      </section>

      {/* HIGHLIGHT SECTION */}
      <section className="about-highlight">
        <p>
          PrimePoll is built using the MERN stack with real-time Socket.io
          technology, ensuring smooth live polling and a fast user experience.
        </p>
      </section>

      {/* SMALL CONTACT MESSAGE */}
      <section className="about-contact">
        <p>
          Have suggestions or feedback? We'd love to hear from you.  
          Contact us anytime at <strong>support@primepoll.com</strong>
        </p>
      </section>

    </main>
  );
};

export default About;
