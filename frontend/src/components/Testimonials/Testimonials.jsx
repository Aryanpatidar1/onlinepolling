import React from "react";
import { FaStar } from "react-icons/fa";
import "./Testimonials.css";

const Testimonials = () => {
  const reviews = [
    {
      id: 1,
      name: "Ankit Sharma",
      role: "Marketing Manager",
      comment:
        "PulsePoll helped us gather honest feedback instantly. The live results feature is a game changer!",
      rating: 5,
      img: "https://images.unsplash.com/photo-1577760960310-c49bbb09161e?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      name: "Priya Singh",
      role: "Content Creator",
      comment:
        "Super clean UI! Creating polls and sharing them with my audience feels effortless.",
      rating: 4,
      img: "https://images.unsplash.com/photo-1646979201277-aca83fa543c3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 3,
      name: "Rahul Verma",
      role: "Software Engineer",
      comment:
        "The real-time insights are incredibly helpful. Love the dark theme and smooth animations.",
      rating: 5,
      img: "https://images.unsplash.com/photo-1568263624836-7982da50b54d?q=80&w=919&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  return (
    <section className="testimonials container">
      <h2 className="testi-heading">What People Say</h2>
      <p className="testi-subheading">
        Loved by thousands — here’s what our users think about PulsePoll.
      </p>

      <div className="test-grid">
        {reviews.map((review) => (
          <div key={review.id} className="testi-card">
            <div className="testi-top">
              <img src={review.img} alt={review.name} className="testi-img" />
              <div>
                <h3 className="testi-name">{review.name}</h3>
                <p className="test-role">{review.role}</p>
              </div>
            </div>

            <p className="test-comment">{review.comment}</p>
            <div className="testi-stars">
              {Array.from({ length: review.rating }).map((_, i) => (
                <FaStar key={i} className="testi-star" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
