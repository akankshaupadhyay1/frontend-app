'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [formData, setFormData] = useState({
    Country: '',
    Company: '',
    BaseRate: '',
    Inflation: '',
    GDP: '',
    RegulationScore: '',
    LoanAmount: '',
    LoanTerm: ''
  });

  const [error, setError] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('/api/predict', formData);

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      localStorage.setItem('loan_rate', response.data.loan_rate);
      router.push('/result');
    } catch (err) {
      console.error('API request error:', err);
      setError(err.response?.data?.detail || err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div>
      <h1>Loan Prediction Form</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <input
            key={key}
            name={key}
            placeholder={key}
            value={formData[key]}
            onChange={handleChange}
            required
          />
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
