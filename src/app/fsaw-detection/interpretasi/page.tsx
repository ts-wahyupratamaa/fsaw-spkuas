import Link from 'next/link';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { AggregatedScore, formatFuzzyValue } from '@/utils/fuzzy/fuzzySaw';

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

export default function InterpretasiPage({ searchParams }: { searchParams?: { data?: string } }) {
  const ranking = parseRanking(searchParams?.data);
  const topChoice = ranking[0];
  const runnerUp = ranking[1];
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
                  Alternatif <span className='font-semibold text-white'>{topChoice.alternativeName}</span> menempati skor teratas
                  (crisp {topChoice.crispScore.toFixed(3)}) setelah agregasi TFN dan pembobotan ΣW. Nilai ini menggambarkan
                  bahwa performanya paling konsisten terhadap preferensi kriteria yang dimodelkan.
                </>
              ) : (
                'Tidak ada data ranking yang dikirimkan. Kembali ke halaman utama untuk menjalankan perhitungan.'
              )}
            </p>
            {topChoice && runnerUp && margin && (
              <p className='text-white/70'>
                Selisih terhadap peringkat kedua ({runnerUp.alternativeName}) sebesar {margin} poin crisp. Margin ini memberi
                konteks seberapa yakin sistem terhadap rekomendasi utamanya—semakin besar jarak, semakin kuat prioritasnya.
              </p>
            )}
          </div>

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
                      ? 'Sinyal utama untuk intervensi: semua kriteria memenuhi bobot target dengan stabil.'
                      : 'Masih memenuhi kriteria, namun kalah stabilitas TFN dibanding kandidat di atasnya.'}
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
}
