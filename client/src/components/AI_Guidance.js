import React, { useRef, useState } from 'react';
import Header from './Header';
import './Styles/ai.css';

const symptomData = {
  "Fever": ["Calpol", "Paracip"],
  "Cold": ["Montina L", "Montek LC", "Levocet M"],
  "Cough": ["Mucolite tablet", "Alkof", "Almox"],
  "Vomiting": ["Avomine", "Vomistop", "Vimikind", "Ondem"],
  "Headache": ["Nise", "Nicip", "Nimekpara"],
  "Body Pain": ["Zerodol 100 mg", "Hifenac"],
  "Fever + Body pain": ["Instagesic MR", "Acemiz MR", "Acenac MR"],
  "Cold And Cough": ["Cheston Cold", "Sinarest", "Solvincold"],
  "Stomach pain": ["Cyclopam", "Spasmelan", "Spasmonil"],
  "Itching": ["Atarax", "Avil", "Okacet", "Cetcip"],
  "Runny nose": ["Diphenhydramine"],
  "Acidity": ["Antacids", "Eno Fruit Salt Lemon 100 gm", "Gelusil MPS Liquid"],
};

export default function AI_Guidance() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [prescription, setPrescription] = useState([]);
  const prescriptionRef = useRef();

  const handleSymptomChange = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const generatePrescription = () => {
    const prescriptionList = selectedSymptoms.map((symptom) => ({
      symptom,
      medicine: symptomData[symptom][0], // Select the first medicine as default
    }));
    setPrescription(prescriptionList);
  };

  const printPrescription = () => {
    const printContents = prescriptionRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
  };

  return (
    <>
      <Header />
      <div className="ai-guidance-container">
        <h1>AI Guidance</h1>
        <p>Select your symptoms and click "Generate Prescription".</p>
        <div className="symptom-list">
          {Object.keys(symptomData).map((symptom) => (
            <div key={symptom} className="symptom-item">
              <label>
                <input
                  type="checkbox"
                  value={symptom}
                  onChange={() => handleSymptomChange(symptom)}
                  checked={selectedSymptoms.includes(symptom)}
                />
                {symptom}
              </label>
            </div>
          ))}
        </div>
        <button className="generate-button" onClick={generatePrescription}>
          Generate Prescription
        </button>
        {prescription.length > 0 && (
          <>
            <div className="prescription-section" ref={prescriptionRef}>
              <h2>Your Prescription</h2>
              <ul>
                {prescription.map((item, index) => (
                  <li key={index}>
                    <strong>{item.symptom}:</strong> {item.medicine}
                  </li>
                ))}
              </ul>
              <p className="warning-text">
                <strong>Note:</strong> Take only 2 tablets. If symptoms persist,
                consult a doctor immediately.
              </p>
            </div>
            <button className="print-button" onClick={printPrescription}>
              Print Prescription
            </button>
          </>
        )}
      </div>
    </>
  );
}
