import React from 'react';
import { Link } from 'react-router-dom';
import bannerImg from "../../assets/banner.png";

const Banner = () => {
  return (
    <div className='flex flex-col md:flex-row-reverse py-16 justify-between items-center gap-12'>
      
      {/* Right side image */}
      <div className='md:w-1/2 w-full flex items-center md:justify-end'>
        <img src={bannerImg} alt="Banner" />
      </div>
      
      {/* Left side content */}
      <div className='md:w-1/2 w-full'> 
        <h1 className='md:text-5xl text-2xl font-medium mb-7'>
          New Releases This Week
        </h1>
        <p className='mb-10'>
          It's time to update your reading list with some of the latest and greatest releases in the literary world. From heart-pumping thrillers to captivating memoirs, this week's new releases offer something for everyone.
        </p>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
          <Link to="/login">
            <button className="btn-primary">Get Started</button>
          </Link>

          <Link to="/book-swap">
            <button className="btn-primary">Book Swapping Marketplace</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Banner;