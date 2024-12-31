import React from 'react';
import Header from './Header';
import './Styles/Home.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/book');
  };

  const handleAIClick = () => {
    navigate('/ai_guidance');
  };

  return (
    <>
      <Header />
      <section className="section hero" aria-label="hero" data-section>
        <div className="container">
          <div className="hero-content">
            <h1 className="h2 hero-title">Better Health with Expert Doctor Consultations</h1>
            <p className="hero-text">
              At DoctorGuidance, we offer everything you need to manage your health.
              Connect with experienced doctors for online consultations, access AI-powered prescriptions, and receive
              personalized medical advice. Whether you need expert guidance or second opinions, we're here to support your health journey.
            </p>
            <div className="btn-group">
              <button onClick={handleClick} className="btn btn-primary">Contact Doctor</button>
              <button onClick={handleAIClick} className="btn btn-primary">Get AI Suggestion</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
