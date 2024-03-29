// src/pages/index.tsx
import { useState } from "react";
import type { NextPage } from "next";
import TimeChart from "../components/TimeChart";
import QuoteSlider from "../components/QuoteSlider";
import ProductScreenshots from "../components/ProductScreenshots";
import Head from "next/head";
import PilotForm from "../components/PilotForm";
import Link from "next/link";
import Image from "next/image";

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
        <meta property="og:image" content="https://phonescreen.ai/og2.png" />

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
            <p className="mt-3 max-w-md font-normal mx-auto text-xl text-gray-800 sm:text-xl md:mt-5 md:max-w-3xl">
              Flip recruiting on its head- Instead of drowning in resumes that
              never get read, let AI call, screen, and rank your candidates for
              you.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="rounded-md shadow">
                <a
                  href="#pilot-program"
                  className="w-full h-20 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-700 hover:bg-red-800 md:py-4 md:text-xl md:px-10"
                >
                  Join Beta Program
                </a>
              </div>
              <div className="rounded-md shadow">
                <a
                  href="#"
                  onClick={toggleModal}
                  className="w-full h-20 text-bold flex items-center justify-center px-8 py-3 border-2 border-gray-800 text-base font-medium rounded-md text-gray-800 hover:bg-gray-400 hover:text-gray-800 md:py-4 md:text-xl md:px-10"
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
                <Image
                  src="/office-shot.jpg"
                  layout="fill"
                  objectFit="cover"
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
            <div className="relative h-40 w-40">
              <Image
                src="/dunder.png"
                alt="Dunder Mifflin logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="relative h-32 w-32">
              <Image
                src="/schrute_farms.webp"
                alt="Schrute Farms logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <div className="relative h-36 w-36">
              <Image
                src="/vance.png"
                alt="Vance Refrigeration logo"
                layout="fill"
                objectFit="contain"
              />
            </div>
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
      <QuoteSlider />
      <section className="bg-gray-900 overflow-hidden md:py-20 lg:py-16">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="lg:flex lg:items-center lg:space-x-10">
            <div className="lg:flex-1">
              <TimeChart />
            </div>
            <div className="mt-10 lg:flex-1 lg:mt-0 bg-transparent shadow-xl rounded-xl p-8 space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-yellow-200 sm:text-4xl">
                Escape the Resume Dungeon
              </h2>
              <p className="mt-3 text-lg leading-7 text-white">
                At Dunder Mifflin, we used to have a room called the Resume
                Dungeon, where resumes would pile up like Dwight&rsquo;s beet
                harvest. But now, with PhoneScreen.AI, we&apos;ve turned it into
                the cafe disco! Say goodbye to endless hours of sifting through
                resumes and hello to more time for office pranks.
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-yellow-200 sm:text-4xl">
                Screen Like a Boss
              </h2>
              <p className="mt-3 text-lg leading-7 text-white">
                Remember when Michael accidentally screened out the perfect
                candidate because their paper resume didn&apos;t mention
                anything about paper!? With PhoneScreen.AI, we ensure that no
                qualified candidate is left behind, open up your screening to
                all who apply.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ProductScreenshots />
      <section className="py-16 bg-yellow-200 overflow-hidden  border-t-4 border-gray-300">
        <div className="relative max-w-xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 sm:text-4xl">
            Think you have what it takes to sell paper at Dunder Mifflin?
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-800">
            Enter your phone number on our demo page and our AI Agent will give
            you a call to screen you for a job at Dunder&nbsp;Miffilin.
          </p>
          <div className="mt-8">
            <Link
              href="/apply/17"
              className="w-full h-20 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-700 hover:bg-red-800 md:py-4 md:text-xl md:px-10"
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
