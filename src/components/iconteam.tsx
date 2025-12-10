'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const frontMembers = [
  { name: 'Mahluk Pelengkap', src: '/team/sarah.png' },
  { name: 'Raja SPK Manual', src: '/team/meita.png'},
  { name: 'Raja Machine Learning', src: '/team/fiky.png' },
];

const trailingMember = { name: 'Raja Js', src: '/team/wahyu.png' };

const wiggle = (delay = 0, duration = 3) => ({
  initial: { rotate: 0, y: 0 },
  animate: {
    rotate: ['-4deg', '4deg', '-4deg'],
    y: [0, -16, 0],
  },
  transition: {
    repeat: Infinity,
    duration,
    ease: 'easeInOut',
    delay,
  },
});

const IconBubble = ({
  src,
  size,
  delay,
  duration = 3,
  alt,

  containerHeight,
  lineOffset,
}: {
  src: string;
  size: number;
  delay?: number;
  duration?: number;
  alt: string;

  containerHeight: number;
  lineOffset: number;
}) => {
  const motionProps = wiggle(delay, duration);
  const bubbleTopOffset = containerHeight / 2 - size / 2;
  const circleRadius = 6; // px (tailwind h-3)
  const stringLength = Math.max(bubbleTopOffset - lineOffset + circleRadius, 24);
  const circleTop = (lineOffset - circleRadius) - bubbleTopOffset;
  return (
    <motion.div
      className='group relative flex items-center justify-center overflow-visible '
      style={{ width: size, height: size }}
      initial={motionProps.initial}
      animate={motionProps.animate}
      transition={motionProps.transition}
      tabIndex={0}
    >
      <span
        className='pointer-events-none absolute left-1/2 flex -translate-x-1/2 flex-col items-center text-slate-300'
        style={{ top: circleTop }}
        aria-hidden
      >
        <span className='mb-1 h-3 w-3 ' />
        <span
          className='w-px border-l-2 border-dashed border-slate-300/80'
          style={{ height: stringLength }}
        ></span>
      </span>
      <div className='relative h-full w-full overflow-hidden mt-2 '>
        <Image src={src} alt={alt} fill sizes={`${size}px`} className='object-cover' />
      </div>
      <div className='pointer-events-none absolute left-1/2 top-full mt-3 flex -translate-x-1/2 flex-col items-center text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100'>
        <span className='bg-white px-2 py-1 text-xs font-semibold text-slate-900 '>
          {alt}
        </span>
      </div>
    </motion.div>
  );
};

const IconTeam = () => {
  const marqueeDuration = 28;
  const frontSpacing = 1.1;
  const trailingDelay = 7.5;
  const containerHeight = 184; // tighter footprint to keep hero content above the fold
  const lineOffset = 24; // matches updated dashed wire offset
  const lineup = [
    { ...frontMembers[0], size: 120, delay: 0 },
    { ...frontMembers[1], size: 120, delay: frontSpacing },
    { ...frontMembers[2], size: 120, delay: frontSpacing * 2 },
    { ...trailingMember, size: 150, delay: trailingDelay },
  ];

  return (
    <div className='relative left-1/2 right-1/2 mb-2 h-40 w-screen -translate-x-1/2 overflow-hidden md:h-48 lg:h-56'>
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl' aria-hidden />
      <div className='pointer-events-none absolute inset-x-0 top-4 flex h-6 items-center md:top-6 md:h-8' aria-hidden>
        <div className='h-px w-full border-t-2 border-dashed border-slate-200'></div>
      </div>
      {lineup.map((member) => (
        <motion.div
          key={member.name}
          className='absolute top-1/2 -translate-y-1/2'
          style={{ willChange: 'transform' }}
          initial={{ x: '115vw' }}
          animate={{ x: '-115vw' }}
          transition={{
            duration: marqueeDuration,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            delay: member.delay,
          }}
        >
          <IconBubble
            src={member.src}
            size={member.size}
            alt={member.name}

            delay={0}
            duration={3.8}
            containerHeight={containerHeight}
            lineOffset={lineOffset}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default IconTeam;
