"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import IconTeam from '@/components/iconteam';
import { GridPatternDemo } from '@/components/fragments/molecule/GridPatternDemo';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { cn } from '@/lib/utils';

const world = `Laboratorium Keputusan Fuzzy SAW`;

type NoteItem = {
  step: string;
  title: string;
  description: string;
  accent: string;
  pinColor: string;
  side: 'left' | 'right';
  wrapperClass: string;
  rotation: string;
};

const noteItems: NoteItem[] = [
  {
    step: '01',
    title: 'Kenali Permasalahan',
    description:
      'Selaraskan masalah yang mau dipecahkan supaya kriteria penilaian relevan dan tidak melebar ke mana-mana.',
    accent: 'from-[#ffe7d9] via-white to-white',
    pinColor: 'from-[#ff8a5c] to-[#ff3d77]',
    side: 'right',
    wrapperClass: 'md:-translate-y-6 md:translate-x-4',
    rotation: 'rotate-3',
  },
  {
    step: '02',
    title: 'Susun Kriteria',
    description:
      'Tentukan faktor utama dan bobotnya agar sistem langsung tahu prioritas ketika menilai alternatif.',
    accent: 'from-[#e1e8ff] via-white to-white',
    pinColor: 'from-[#6f7dff] to-[#4c51bf]',
    side: 'right',
    wrapperClass: 'md:-translate-y-2 md:-translate-x-2',
    rotation: '-rotate-3',
  },
  {
    step: '03',
    title: 'Nilai Fuzzy',
    description:
      'Konversi data kualitatif/kuantitatif ke skala fuzzy supaya semuanya sejajar saat dihitung.',
    accent: 'from-[#f1e8ff] via-white to-white',
    pinColor: 'from-[#c084fc] to-[#9333ea]',
    side: 'right',
    wrapperClass: 'md:translate-y-6 md:translate-x-6',
    rotation: 'rotate-2',
  },
];

const NoteCard = ({ note, index }: { note: NoteItem; index: number }) => (
  <motion.div
    className={cn('relative w-48 sm:w-56 md:w-56', note.wrapperClass)}
    initial={{ y: 0, rotate: 0 }}
    animate={{ y: [0, -18, 0], rotate: [0, 1.6, 0] }}
    transition={{ duration: 6 + index, repeat: Infinity, repeatType: 'mirror', delay: index * 0.45, ease: 'easeInOut' }}
  >
    <div className='absolute -top-12 left-1/2 flex -translate-x-1/2 flex-col items-center'>
      <span
        className={cn(
          'h-6 w-6 rounded-full border border-white/50 shadow-[0_10px_20px_rgba(15,23,42,0.18)]',
          `bg-gradient-to-br ${note.pinColor}`
        )}
      ></span>
      <span className='block h-5 w-[2px] rounded-full bg-slate-200'></span>
    </div>
    <div
      className={cn(
        'relative rounded-[28px] border border-white/60 bg-white/90 p-4 text-left shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur',
        note.rotation
      )}
    >
      <div className={cn('absolute inset-0 rounded-[28px] opacity-80 blur-[1px]', `bg-gradient-to-br ${note.accent}`)}></div>
      <div className='relative flex flex-col gap-2'>
        <span className='w-fit rounded-full bg-slate-900/5 px-3 py-0.5 text-[0.65rem] font-semibold tracking-[0.3em] text-slate-500'>
          {note.step}
        </span>
        <h3 className='text-base font-semibold text-slate-900'>{note.title}</h3>
        <p className='text-xs leading-relaxed text-slate-600'>{note.description}</p>
      </div>
    </div>
  </motion.div>
);

const Section = () => {
  const rightNotes = noteItems.filter((note) => note.side === 'right');

  return (
    <section
      id='home-section'
      className='relative flex w-full min-h-screen items-start justify-center overflow-hidden py-8 md:py-14'
    >
      <GridPatternDemo className='absolute inset-0 h-full w-full' />
      <div className='relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 md:px-8'>
        <IconTeam />
        <div className='relative flex flex-col gap-12'>
          <div className='flex flex-col-reverse items-center gap-10 md:flex-row md:items-center md:justify-between'>
            <div className='flex w-full max-w-2xl flex-col gap-6 text-center md:text-left'>
              <h2 className='text-3xl font-extrabold text-black md:text-5xl lg:text-6xl'>
                <TextGenerateEffect words={world} className='w-full font-extrabold' textColor='text-black' />
              </h2>

              <p className='text-base leading-relaxed text-gray-700 md:text-lg lg:text-xl'>
                Rancang sistem pengambilan keputusan berbasis Fuzzy Simple Additive Weighting dari nol. Bandingkan
                alternatif, lakukan konversi fuzzy, dan tetapkan bobot otomatis supaya pilihan terbaik muncul dengan
                jelas.
              </p>
              <div className='mt-6 flex justify-center md:justify-start'>
                <Link href='/fsaw-detection' passHref>
                  <ShimmerButton className='px-6 py-2 text-sm font-semibold' background='#87003d' shimmerSize='0.12em'>
                    Mulai Hitung
                  </ShimmerButton>
                </Link>
              </div>
            </div>

            <div className='relative flex w-full max-w-[520px] flex-col items-center gap-8 md:flex-row md:items-center md:justify-end'>
              <div className='relative h-56 w-56 overflow-hidden rounded-xl sm:h-72 sm:w-72 md:h-80 md:w-80 lg:h-96 lg:w-96'>
                {/* <Image src='/gigii.png' alt='Logo' width={600} height={600} className='object-cover' /> */}
              </div>
              <div className='hidden md:flex -mt-10 flex-col items-end gap-10'>
                {rightNotes.map((note, index) => (
                  <NoteCard key={note.step} note={note} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Section;
