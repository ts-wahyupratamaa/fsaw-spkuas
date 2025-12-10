'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <motion.div
      className={`fixed top-0 left-0 w-full h-[100px] z-50 transition-shadow duration-300 ${
        isScrolled ? 'shadow-md bg-white' : 'shadow-none bg-white'
      }`}
      animate={{ y: 0, opacity: 1 }}
      initial={{ y: -100, opacity: 0 }}
    >
      <div className='mx-auto flex justify-between items-center max-w-7xl h-full px-4 sm:px-6'>
        <Link href='/' className='text-3xl md:text-5xl font-bold'>
          {/* <Image src='/gigi.png' alt='Logo' width={70} height={70} /> */}
        </Link>
        <motion.div
          className='flex gap-3 items-center'
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <div className='flex items-center text-center gap-5'>
              <button
                type='button'
                className='py-2 px-4 rounded-sm bg-[#F8E8F2] text-[#7c1835] transition-colors duration-200 font-bold text-sm sm:text-base shadow-[0_8px_30px_rgba(124,24,53,0.15)] hover:-translate-y-[1px] active:translate-y-[1px]'
                onClick={() => {
                  const element = document.getElementById('home-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                team greenflag
              </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Navbar;
