import React from "react";
import { FaGraduationCap, FaWhatsapp, FaUsers } from "react-icons/fa";
import "./UseCases.css";

const useCases = [
  {
    icon: <FaGraduationCap />,
    title: "Classes & campus",
    description:
      "Let classmates choose a topic, activity, or time that works for everyone.",
  },
  {
    icon: <FaWhatsapp />,
    title: "WhatsApp groups",
    description:
      "Share a poll link in the chat. With anonymous voting on, people can vote without an account.",
  },
  {
    icon: <FaUsers />,
    title: "Events & teams",
    description:
      "Get quick preferences from attendees or teammates and follow results as they come in.",
  },
];

const UseCases = () => (
  <section className="use-cases container">
    <h2 className="use-cases-heading">Made for decisions in groups</h2>
    <p className="use-cases-subheading">
      From campus chats to event teams, make it easy for everyone to have a say.
    </p>

    <div className="use-cases-grid">
      {useCases.map((useCase) => (
        <article className="use-case-card" key={useCase.title}>
          <div className="use-case-icon">{useCase.icon}</div>
          <h3>{useCase.title}</h3>
          <p>{useCase.description}</p>
        </article>
      ))}
    </div>
  </section>
);

export default UseCases;
