import React, { useState } from "react";
import { track } from "@vercel/analytics";
import { usePostHog } from "posthog-js/react";

const PilotForm = () => {
  const posthog = usePostHog();
  const [formState, setFormState] = useState({
    company: "",
    firstName: "",
    lastName: "",
    email: "",
    weeklyApplicants: 0,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/pilot-application", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });
    const data = await response.json();
    if (response.ok) {
      console.log("Application submitted", data);
      track("Pilot submission", data);
      posthog.capture("Lead Generated", data);
      // Handle success case
      setFormState({
        company: "",
        firstName: "",
        lastName: "",
        email: "",
        weeklyApplicants: 0,
      });
      setIsSubmitted(true);
    } else {
      console.error("Error submitting application", data);
      // Handle error case
    }
  };

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  if (isSubmitted) {
    // If the form is submitted, display the confirmation message
    return (
      <h2 className="text-white text-xl pt-4">
        Thank you for your submission, our team will be in touch!
      </h2>
    );
  }

  return (
    <form
      className="mt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
      onSubmit={handleSubmit}
    >
      <div>
        <label htmlFor="company" className="sr-only">
          Company
        </label>
        <input
          onChange={handleChange}
          value={formState.company}
          type="text"
          name="company"
          id="company"
          autoComplete="company"
          required
          className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-yellow-200 focus:border-yellow-200 sm:text-sm border-gray-300 rounded-md"
          placeholder="Company"
        />
      </div>
      <div>
        <label htmlFor="firstName" className="sr-only">
          First Name
        </label>
        <input
          onChange={handleChange}
          value={formState.firstName}
          type="text"
          name="firstName"
          id="firstName"
          autoComplete="given-name"
          required
          className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-yellow-200 focus:border-yellow-200 sm:text-sm border-gray-300 rounded-md"
          placeholder="First Name"
        />
      </div>
      <div>
        <label htmlFor="lastName" className="sr-only">
          Last Name
        </label>
        <input
          onChange={handleChange}
          value={formState.lastName}
          type="text"
          name="lastName"
          id="lastName"
          autoComplete="family-name"
          required
          className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-yellow-200 focus:border-yellow-200 sm:text-sm border-gray-300 rounded-md"
          placeholder="Last Name"
        />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          onChange={handleChange}
          value={formState.email}
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          required
          className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-yellow-200 focus:border-yellow-200 sm:text-sm border-gray-300 rounded-md"
          placeholder="Email"
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="weeklyApplicants" className="sr-only">
          Average # of weekly job applicants
        </label>
        <p className="text-white">Average number of weekly job applicants</p>
        <input
          onChange={handleChange}
          value={formState.weeklyApplicants}
          type="number"
          name="weeklyApplicants"
          id="weeklyApplicants"
          required
          className="block w-full shadow-sm py-3 px-4 placeholder-gray-500 focus:ring-yellow-200 focus:border-yellow-200 sm:text-sm border-gray-300 rounded-md"
          placeholder="Average # of weekly job applicants"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full h-20 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-yellow-200 hover:bg-yellow-300 md:py-4 md:text-xl md:px-10"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default PilotForm;
