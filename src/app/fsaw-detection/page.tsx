import type { Metadata } from 'next';
import { siteMetadata } from '@/lib/siteMetadata';
import FsawDetectionClient from './FsawDetectionClient';

const pageTitle = 'Deteksi Fuzzy SAW & Ranking Alternatif';
const pageDescription =
  'Masukkan alternatif, bobot, dan nilai fuzzy untuk langsung melihat normalisasi, pembobotan, serta ranking metode SAW yang transparan.';
const fsawDetectionUrl = new URL('/fsaw-detection', siteMetadata.siteUrl).toString();

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: fsawDetectionUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: fsawDetectionUrl,
    images: [
      {
        url: siteMetadata.socialImage,
        width: 1200,
        height: 630,
        alt: pageTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [siteMetadata.socialImage],
  },
};

export default function FsawDetectionPage() {
  return <FsawDetectionClient />;
}
