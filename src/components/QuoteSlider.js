import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const quotes = [
  {
    quote:
      "It's like having a robot assistant, but better because it doesn't need a plug. It's like the HAL 9000 of recruiting, but without the whole 'taking over the spaceship' thing. It's genius, really.",
    author: "Michael Scott",
    image: "/michael-scott.jpeg",
  },
  {
    quote:
      "It's so nice to not have to read through a pile of resumes anymore. Now I can spend more time with Bob Vance, Vance Refrigeration.",
    author: "Phyllis Smith",
    image: "/phyllis-smith.jpeg",
  },
  {
    quote:
      "I was skeptical at first, but I have to admit, it's like having an army of Dwights screening candidates, minus the beet juice breaks.",
    author: "Dwight Schrute",
    image: "/dwight-schrute.jpeg",
  },
];

const QuoteSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
  };

  return (
    <div className="bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Slider {...settings}>
          {quotes.map((quote, index) => (
            <div key={index} className="outline-none">
              <div className="flex flex-col md:flex-row items-center justify-center md:space-x-8">
                <div className="w-full md:w-1/2">
                  <img
                    src={quote.image}
                    alt={quote.author}
                    className="w-full h-auto rounded-lg shadow-xl"
                  />
                </div>
                <div className="w-full md:w-1/2 mt-6 md:mt-0">
                  <p className="text-gray-900 text-2xl font-semibold mb-4">
                    {quote.quote}
                  </p>
                  <p className="text-gray-600 text-xl">- {quote.author}</p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default QuoteSlider;
