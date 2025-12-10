"use client";

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { AggregatedScore, calculateFuzzySaw, formatFuzzyValue } from '@/utils/fuzzy/fuzzySaw';
import { useFuzzySawStore } from '@/store/fuzzySawStore';

const parseRanking = (raw?: string): AggregatedScore[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => ({
        alternativeId: item.alternativeId ?? '',
        alternativeName: item.alternativeName ?? 'Alternatif',
        fuzzyScore: item.fuzzyScore,
        crispScore: Number(item.crispScore ?? 0),
      }))
      .filter((item) => item.alternativeId);
  } catch {
    return [];
  }
};

const formatDelta = (top?: AggregatedScore, second?: AggregatedScore) => {
  if (!top || !second) return null;
  const delta = top.crispScore - second.crispScore;
  return delta >= 0 ? delta.toFixed(3) : null;
};

export default function InterpretasiPage() {
  return (
    <Suspense fallback={<InterpretasiFallback />}>
      <InterpretasiContent />
    </Suspense>
  );
}

const InterpretasiFallback = () => (
  <div className='min-h-screen bg-gradient-to-b from-[#14010a] via-[#250016] to-[#050006] text-white'>
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12'>
      <div className='rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70'>
        Menyiapkan narasi interpretasi fuzzy...
      </div>
    </div>
  </div>
);

const InterpretasiContent = () => {
  const searchParams = useSearchParams();
  const queryRanking = useMemo(() => parseRanking(searchParams?.get('data') ?? undefined), [searchParams]);

  const { criteria, alternatives } = useFuzzySawStore();
  const results = useMemo(() => calculateFuzzySaw(criteria, alternatives), [criteria, alternatives]);

  const ranking = results.ranking.length > 0 ? results.ranking : queryRanking;
  const topChoice = ranking[0];
  const runnerUp = ranking[1];
  const lastChoice = ranking.length > 1 ? ranking[ranking.length - 1] : undefined;
  const margin = formatDelta(topChoice, runnerUp);

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#14010a] via-[#250016] to-[#050006] text-white'>
      <div className='mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12'>
        <Link
          href='/fsaw-detection'
          className='inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white'
        >
          <FaArrowLeftLong /> Kembali ke tabel SAW
        </Link>

        <section className='space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl'>
          <div className='space-y-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-white/50'>Interpretasi Fuzzy</p>
            <h1 className='text-3xl font-bold'>Narasi Penentuan Prioritas</h1>
            <p className='text-white/80'>
              {topChoice ? (
                <>
                  Saat ini <span className='font-semibold text-white'>{topChoice.alternativeName}</span> memimpin dengan nilai
                  crisp {topChoice.crispScore.toFixed(3)}. Ini berarti kombinasi nilai TFN-nya paling stabil terhadap
                  preferensi bobot yang sedang aktif di tabel utama.
                </>
              ) : (
                'Tidak ada data ranking yang dikirimkan. Kembali ke halaman utama untuk menjalankan perhitungan.'
              )}
            </p>
            {topChoice && runnerUp && margin && (
              <p className='text-white/70'>
                Selisih dengan peringkat kedua ({runnerUp.alternativeName}) saat ini {margin} poin crisp. Jika jarak ini makin
                lebar setelah Anda penyesuaian data, rekomendasi semakin mantap; kalau mengecil berarti dua kandidat saling
                bersaing ketat.
              </p>
            )}
            {topChoice && lastChoice && lastChoice.alternativeId !== topChoice.alternativeId && (
              <p className='text-white/60'>
                Kandidat terendah saat ini, {lastChoice.alternativeName}, masih bisa dikejar dengan meningkatkan nilai fuzzy
                pada kriteria yang memiliki bobot besar seperti {criteria[0]?.name ?? 'kriteria utama'}.
              </p>
            )}
          </div>

          {topChoice && (
            <div className='rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-5 text-sm text-emerald-50'>
              <p className='text-xs uppercase tracking-[0.4em] text-emerald-200'>Hasil Akhir</p>
              <p className='mt-2 text-lg font-semibold text-white'>Fokuskan perhatian pada {topChoice.alternativeName}</p>
              <p className='mt-2 text-white/80'>
                Nilai crisp {topChoice.crispScore.toFixed(3)} dan TFN {formatFuzzyValue(topChoice.fuzzyScore)} mengisyaratkan
                performa paling siap untuk diimplementasikan. Gunakan kandidat ini sebagai baseline sebelum mengeksplor opsi
                lain.
              </p>
            </div>
          )}

          {ranking.length > 0 && (
            <div className='grid gap-4'>
              {ranking.map((item, index) => (
                <div
                  key={item.alternativeId}
                  className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80'
                >
                  <div className='flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-white/60'>
                    <span>Peringkat {index + 1}</span>
                    <span>Nilai Crisp {item.crispScore.toFixed(3)}</span>
                  </div>
                  <p className='mt-3 text-lg font-semibold text-white'>{item.alternativeName}</p>
                  <p className='mt-2 font-mono text-xs text-white/70'>ΣW TFN: {formatFuzzyValue(item.fuzzyScore)}</p>
                  <p className='mt-3 text-white/75'>
                    {index === 0
                      ? 'Sinyal utama untuk intervensi: indikator fuzzy-nya paling konsisten terhadap bobot prioritas.'
                      : index === ranking.length - 1
                        ? 'Perlu perhatian ekstra: nilai fuzzy beberapa kriteria masih jauh dari kandidat unggulan.'
                        : 'Bisa dipertimbangkan jika membutuhkan alternatif cadangan, tapi masih kalah stabil dari posisi di atasnya.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <p className='text-center text-xs text-white/50'>Interpretasi hanya bersifat naratif. Gunakan tabel utama jika membutuhkan angka lengkap.</p>
      </div>
    </div>
  );
};
