import React from "react";
import Image from "next/image";
import Link from "next/link";

const ProductScreenshots = () => {
  const screenshots = [
    {
      title: "Upload Your Job Posts",
      description: (
        <>
          <p className="mb-6 text-gray-800">
            Paste in the details of your open jobs and our AI parses the details
            like <strong>location, skills, salary</strong> and experience.
          </p>
          <p className="mb-6 text-gray-800">
            Then our AI system{" "}
            <strong>generates 10 challenging interview questions</strong>
            based on the skills and requirements listed in the job post.
          </p>
          <p className="mb-6 text-gray-800">
            <strong>Customize the interview questions</strong> as needed and
            your automated phone screen is ready to go.
          </p>
        </>
      ),
      media: "/editjob.mp4",
    },
    {
      title: "Share Application Links",
      description: (
        <>
          <p className="mb-6 text-gray-800">
            Every job post you create comes with a{" "}
            <strong>unqiue application link</strong>.{" "}
            <Link
              href="/apply/76fa4f80-7250-428b-bcbd-86c9d91d5d00"
              target="_blank"
              className="text-blue-600"
            >
              Like this one &gt;
            </Link>
          </p>
          <p className="mb-6 text-gray-800">
            We recommend putting this{" "}
            <strong>link directly in your public job post</strong> and allow
            anyone to receive an automated phone screen immediately.
          </p>
          <p className="mb-6 text-gray-800">
            Applicants enter their contact information and our{" "}
            <strong>AI agent immediately calls</strong> them to begin the phone
            screen.
          </p>
        </>
      ),
      media: "/apply.mp4",
    },
    {
      title: "Analyze Candidate Performance",
      description: (
        <>
          <p className="mb-6 text-gray-800">
            For each candidate, you&apos;ll receive{" "}
            <strong>a scorecard that includes a detailed breakdown</strong> of
            how the candidate answered every question along with a score.
          </p>
          <p className="mb-6 text-gray-800">
            You can also <strong>playback the audio</strong> of the call, so
            that you have all the information needed to judge the candidate.
          </p>
          <p className="mb-6 text-gray-800">
            View all the candidates for your open jobs in one place to{" "}
            <strong>easily see the top performers</strong>.
          </p>
        </>
      ),
      media: "/score.mp4",
    },
  ];

  return (
    <section className="bg-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-12 text-center">
          How it works
        </h2>
        {screenshots.map((screenshot, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } items-center justify-between mb-20`}
          >
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <video
                  className="w-full h-auto"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src={screenshot.media} type="video/mp4" />
                </video>
              </div>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0 md:px-10">
              <h3 className="text-gray-900 text-3xl font-extrabold mb-4">
                {screenshot.title}
              </h3>
              <div className="text-xl text-gray-600">
                {screenshot.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductScreenshots;
