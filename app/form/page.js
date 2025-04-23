"use client";

import { useRouter } from "next/navigation";
import axios from "axios";

export default function FormPage() {
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      // Collect your form data here
    };

    try {
      const response = await axios.post("/api/predict", formData);
      router.push({
        pathname: "/result",
        query: { data: JSON.stringify(response.data) },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Loan Pricing Form</h2>
      <form onSubmit={handleSubmit}>
        {/* Your form fields here */}
        <button type="submit">Calculate</button>
      </form>
    </div>
  );
}