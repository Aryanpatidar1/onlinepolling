import React from "react";
import "./Team.css";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const Team = () => {
  const members = [
    {
      name: "Gaurav Yadav",
      role: "Founder & Full-Stack Developer",
      img: "https://media.licdn.com/dms/image/v2/D5603AQF5bou2pFABkA/profile-displayphoto-crop_800_800/B56ZrbJn9CI4AI-/0/1764613326672?e=1766620800&v=beta&t=MU-3pPseZA50Glwk54posqriHH_hXBc2Dt03I81SKfw",
      github: "#",
      linkedin: "#",
      instagram: "#",
    },
    {
      name: "Nikhil Kumar",
      role: "UI/UX Designer",
      img: "https://media.licdn.com/dms/image/v2/D4E03AQEJv0hDE9ah0g/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1686721928729?e=1766620800&v=beta&t=LOA1dt23_B-y3FGRlxe-dEGhHfMMCeXced0DbJrLfJE",
      github: "#",
      linkedin: "#",
      instagram: "#",
    },
    {
      name: "Aryan",
      role: "Backend Engineer",
      img: "https://media.licdn.com/dms/image/v2/D5603AQExvLC8NVDN_g/profile-displayphoto-shrink_800_800/B56ZZCxz.bGsAg-/0/1744877084232?e=1766620800&v=beta&t=tJZFE4_9RwhRx6do_Fv86kmfv9SaVFfMYlL3PC4VBEU",
      github: "#",
      linkedin: "#",
      instagram: "#",
    },
  ];

  return (
    <main className="team-page container">
      <section className="team-header">
        <h1>Meet Our Team</h1>
        <p>
          The passionate people behind PrimePoll — building a modern polling
          experience for everyone.
        </p>
      </section>

      
      <section className="team-grid">
        {members.map((member, i) => (
          <div className="team-card" key={i}>
            <img src={member.img} alt={member.name} className="team-img" />

            <h3>{member.name}</h3>
            <p className="team-role">{member.role}</p>

            <div className="team-socials">
              <a href={member.github}>
                <FaGithub />
              </a>
              <a href={member.linkedin}>
                <FaLinkedin />
              </a>
              <a href={member.instagram}>
                <FaInstagram />
              </a>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Team;
