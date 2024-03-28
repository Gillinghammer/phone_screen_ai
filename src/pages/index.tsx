// src/pages/index.tsx
import { useState } from "react";
import type { NextPage } from "next";
import TimeChart from "../components/TimeChart";
import Head from "next/head";
import PilotForm from "../components/PilotForm";
import Link from "next/link";

const Home: NextPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ["/apply-form.png", "/apply-confirm.png", "/candidates.png"];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };
  return (
    <>
      <Head>
        <title>
          PhoneScreen.ai - AI powered recruiting for Phone Screen AI
        </title>
        <meta
          name="description"
          content="Revolutionize Phone Screen AI's hiring process with AI-powered phone screening. Save time and improve candidate selection with PhoneScreen.ai."
        />
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://phonescreen.ai/" />
        <meta
          property="og:title"
          content="PhoneScreen.ai - AI powered recruiting for Phone Screen AI"
        />
        <meta
          property="og:description"
          content="Revolutionize Phone Screen AI's hiring process with AI-powered phone screening. Save time and improve candidate selection with PhoneScreen.ai."
        />
        <meta property="og:image" content="https://phonescreen.ai/og.jpeg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://phonescreen.ai/" />
        <meta
          property="twitter:title"
          content="PhoneScreen.ai - AI powered recruiting for Phone Screen AI"
        />
        <meta
          property="twitter:description"
          content="Revolutionize Phone Screen AI's hiring process with AI-powered phone screening. Save time and improve candidate selection with PhoneScreen.ai."
        />
        <meta
          property="twitter:image"
          content="https://yourwebsite.com/images/twitter-og-image.jpg"
        />
      </Head>
      <div className="relative bg-yellow-200 overflow-hidden">
        <nav className="absolute top-0 left-0 w-full bg-gray-800 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold">PhoneScreen.AI</div>
              {/* Add more navigation items here if needed */}
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto mt-12 py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
          <div className="lg:w-0 lg:flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
              <span className="block">AI Automated</span>
              <span className="block text-red-700">Candidate Screens</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-800 sm:text-xl md:mt-5 md:max-w-3xl">
              Fully automated AI phone screening for your recruiting process.
              Upload a job post, and receive an intelligent AI phone screen
              agent to screen anyone who applies.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="rounded-md shadow">
                <a
                  href="#pilot-program"
                  className="w-full h-20 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-700 hover:bg-red-800 md:py-4 md:text-lg md:px-10"
                >
                  Join Beta Program
                </a>
              </div>
              <div className="rounded-md shadow">
                <a
                  href="#"
                  onClick={toggleModal}
                  className="w-full h-20 text-bold flex items-center justify-center px-8 py-3 border border-gray-800 text-base font-medium rounded-md text-gray-800 hover:bg-gray-400 hover:text-gray-800 md:py-4 md:text-lg md:px-10"
                >
                  <span className="text-3xl">📼</span>&nbsp; Watch Demo
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 w-full lg:mt-0 lg:w-1/2 lg:pl-10">
            <div className="relative">
              {/* Image Block */}
              <div className="relative w-full h-96 bg-gray-800 rounded-lg shadow-xl overflow-hidden lg:h-96">
                <img
                  src="/office-shot.jpg"
                  alt="the"
                  className="w-full h-full object-center object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-yellow-200 border-b-4 border-gray-300">
        <div className="max-w-7xl mx-auto pb-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-6 lg:justify-start">
            <img className="h-20" src="/dunder.png" alt="Dunder Mifflin logo" />
            <img className="h-32" src="/schrute_farms.webp" alt="Logo 3" />
            <img
              className="h-36"
              src="/vance.png"
              alt="Vance Refridgeration logo"
            />
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={toggleModal}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-lg" // Set maximum width to large (lg = 32rem = 512px)
            onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal
            style={{ maxWidth: "600px" }} // Set maximum width to 600px
          >
            <video controls autoPlay className="w-full">
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      <section className="py-12 bg-gray-100 overflow-hidden md:py-20 lg:py-24">
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
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl">
                Escape the Resume Dungeon
              </h2>
              <p className="mt-3 text-lg leading-7 text-gray-800">
                At Dunder Mifflin, we used to have a room called the Resume
                Dungeon, where resumes would pile up like Dwight's beet harvest.
                But now, with PhoneScreen.AI, we've turned it into the cafe
                disco! Say goodbye to endless hours of sifting through resumes
                and hello to more time for office pranks.
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl">
                Screen Like a Boss
              </h2>
              <p className="mt-3 text-lg leading-7 text-gray-800">
                Remember when Michael accidentally screened out the perfect
                candidate because their paper resume didn't mention anything
                about paper!? With PhoneScreen.AI, we ensure that no qualified
                candidate is left behind, open up your screening to all who
                apply.
              </p>
              <div className="relative w-full h-auto flex items-center">
                <button
                  onClick={prevImage}
                  className="absolute left-[-20px] bg-gray-800 text-white p-2 rounded-full"
                >
                  &#x3c; {/* Left arrow */}
                </button>
                <img
                  src={images[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-auto"
                />
                <button
                  onClick={nextImage}
                  className="absolute right-[-20px] bg-gray-800 text-white p-2 rounded-full"
                >
                  &#x3e; {/* Right arrow */}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* First row */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="/michael-scott.jpeg"
                alt="Michael Scott"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <p className="text-2xl font-semibold mb-4">
                "It's like having a robot assistant, but better because it
                doesn't need a plug. It's like the HAL 9000 of recruiting, but
                without the whole 'taking over the spaceship' thing. It's
                genius, really."
              </p>
              <p className="text-gray-600 text-xl">- Michael Scott</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-100">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* First row */}
          <div className="flex flex-col md:flex-row-reverse items-center justify-between mb-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="/phyllis-smith.jpeg"
                alt="Phyllis Smith"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="md:w-1/2 md:pr-8">
              <p className="text-2xl font-semibold mb-4">
                "It's so nice to not have to read through a pile of resumes
                anymore. Now I can spend more time with Bob Vance, Vance
                Refrigeration."
              </p>
              <p className="text-gray-600 text-xl">- Phyllis Smith</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-gray-100">
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* First row */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <img
                src="/dwight-schrute.jpeg"
                alt="Dwigth Schrute"
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div className="md:w-1/2 md:pl-8">
              <p className="text-2xl font-semibold mb-4">
                "I was skeptical at first, but I have to admit, it's like having
                an army of Dwights screening candidates, minus the beet juice
                breaks."
              </p>
              <p className="text-gray-600 text-xl">- Dwight Schrute</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-yellow-200 overflow-hidden  border-t-4 border-gray-300">
        <div className="relative max-w-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl">
            Think you have what it takes to sell paper at Dunder Mifflin?
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-800">
            Enter your phone number on our demo page and our AI Agent will give
            you a call to screen you for a job at Dunder&nbsp;Miffilin.
          </p>
          <p className="mt-4 text-lg leading-7 text-gray-800">
            Don&apos;t worry if you&apos;re not a fit, it&apos;s just a demo!
          </p>
          <div className="mt-8">
            <Link
              href="/apply/17"
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-700 hover:bg-red-800"
            >
              Start Your AI Phone Screen
            </Link>
          </div>
        </div>
      </section>
      <div id="pilot-program" className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Join The PhoneScreen.AI Beta!</span>
          </h2>
          <PilotForm />
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} PhoneScreen.ai for Phone Screen
            AI, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Home;
