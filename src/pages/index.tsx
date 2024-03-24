// src/pages/index.tsx
import type { NextPage } from "next";
import TimeChart from "../components/TimeChart";
import Head from "next/head";
import PilotForm from "../components/PilotForm";

const submitApplication = async (formData) => {
  try {
    const response = await fetch("/api/add-applicant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Application submitted successfully", result);
    // You can redirect the user or clear the form here
  } catch (error) {
    console.error("Error submitting application", error);
    // Handle errors here
  }
};

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>PhoneScreen.ai - Streamline Your Hiring Process</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
          <div className="lg:w-0 lg:flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">AI Powered</span>
              <span className="block text-indigo-600">Candidate Screening</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 sm:text-xl md:mt-5 md:max-w-3xl">
              Natural sounding AI agents call and screen job applicants, saving
              teams immense amounts of time and money.
            </p>
            <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <a
                  href="#pilot-program"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                >
                  Join pilot program
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 w-full lg:mt-0 lg:w-1/2 lg:pl-10">
            <div className="relative">
              {/* video */}
              <video
                className="w-full h-full rounded-xl shadow-2xl"
                src="/demo.mp4"
                controls
              />
            </div>
          </div>
        </div>
      </div>
      <section className="py-12 bg-gray-50 overflow-hidden md:py-20 lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="lg:flex lg:items-center lg:space-x-10">
            {" "}
            {/* Add spacing between items on larger screens */}
            <div className="lg:flex-1">
              {" "}
              {/* This allows the chart to take full width on mobile and flex basis of 1 on lg screens */}
              <TimeChart />
            </div>
            <div className="mt-10 lg:flex-1 lg:mt-0 bg-white shadow-xl rounded-xl p-8 space-y-4">
              {" "}
              {/* This allows the text block to take full width on mobile and flex basis of 1 on lg screens */}
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Recoup lost hours
              </h2>
              <p className="mt-3 text-lg leading-7 text-black">
                The time it takes to review resumes, schedule and conduct phone
                screens is not insignificant and adds up quickly. The average
                company spends more than 60 hours on this process for every 10
                open roles. Recoup nearly all of this time allowing
                PhoneScreen.AI to manage your candidate screening.
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Process more applicants
              </h2>
              <p className="mt-3 text-lg leading-7 text-black">
                Traditional screening is slow and prone to missing qualified
                candidates amidst a stack resumes. PhoneScreen.AI allows you to
                screen all applicants ensuring no qualified candidates get lost
                in the process.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12 bg-white overflow-hidden md:py-20 lg:py-24">
        <div className="relative max-w-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Want to give it a try?
          </h2>
          <p className="mt-4 text-lg leading-7 text-black">
            Enter your phone number on our demo page and our AI Agent will give
            you a call to screen you for the job.
          </p>
          <p className="mt-4 text-lg leading-7 text-black">
            Don't worry if you're not a fit, it's just a demo!
          </p>
          <div className="mt-8">
            <a
              href="/apply/12" // Replace "/demo-landing-page" with the actual path to your landing page
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Start your phone screen
            </a>
          </div>
        </div>
      </section>

      <div id="pilot-program" className="bg-indigo-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">
              Interested in joining our pilot program?
            </span>
          </h2>
          <PilotForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} PhoneScreen.ai, Inc. All rights
            reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Home;
