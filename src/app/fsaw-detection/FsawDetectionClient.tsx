'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeftLong, FaChevronDown, FaPlus, FaRotateLeft, FaTrash } from 'react-icons/fa6';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Ripple } from '@/components/magicui/ripple';
import { useFuzzySawStore } from '@/store/fuzzySawStore';
import {
  calculateFuzzySaw,
  formatScalarValue,
  CriterionType,
} from '@/utils/fuzzy/fuzzySaw';

const words = `Deteksi Fuzzy SAW`;

const SectionCard = ({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => (
  <section className='bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/30 backdrop-blur-md space-y-4'>
    <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
      <div>
        <h2 className='text-2xl font-semibold'>{title}</h2>
        {description && <p className='text-sm text-white/70'>{description}</p>}
      </div>
      {actions && <div className='flex gap-3'>{actions}</div>}
    </div>
    <div className='space-y-4'>{children}</div>
  </section>
);

const FormulaBlock = ({ label, formula }: { label: string; formula: string }) => (
  <div className='rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80'>
    <p className='font-semibold text-white'>{label}</p>
    <p className='mt-1 font-mono text-xs md:text-sm tracking-tight text-white/80'>{formula}</p>
  </div>
);

const isInterimNumeric = (value: string) => {
  const trimmed = value.trim();
  return trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.';
};

const FsawDetectionClient = () => {
  const {
    criteria,
    alternatives,
    addCriterion,
    updateCriterion,
    removeCriterion,
    addAlternative,
    updateAlternativeName,
    removeAlternative,
    updateAlternativeValue,
    resetDefaults,
  } = useFuzzySawStore();

  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});
  const results = useMemo(() => calculateFuzzySaw(criteria, alternatives), [criteria, alternatives]);

  const canRemoveCriterion = criteria.length > 1;
  const canRemoveAlternative = alternatives.length > 1;

  const handleWeightChange = (id: string, value: string) => {
    setWeightInputs((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (isInterimNumeric(value)) {
      return;
    }

    const numericValue = Number(value.replace(',', '.'));
    if (Number.isNaN(numericValue)) {
      return;
    }

    updateCriterion(id, { weight: numericValue });
  };

  const handleWeightBlur = (id: string) => {
    const cachedValue = weightInputs[id];
    if (cachedValue === undefined) {
      return;
    }

    const numericValue = Number(cachedValue.replace(',', '.'));
    updateCriterion(id, { weight: Number.isNaN(numericValue) ? 0 : numericValue });

    setWeightInputs((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleTypeChange = (id: string, value: string) => {
    updateCriterion(id, { type: value as CriterionType });
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#1d0410] via-[#37001c] to-[#0f0013] text-white relative overflow-hidden'>
      <Ripple />
      <div className='relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 space-y-8'>
        <div className='flex flex-col gap-6 text-center md:text-left'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white'
          >
            <FaArrowLeftLong /> Halaman Utama
          </Link>
          <TextGenerateEffect words={words} />
          <p className='text-base text-white/80 md:max-w-3xl mx-auto md:mx-0'>
            Masukkan daftar alternatif, bobot kriteria, dan nilai fuzzy (0 - 1) sesuai skala
            jurnal. Data ini dilatih berdasarkan{' '}
            <Link
              href='https://journals.usm.ac.id/index.php/transformatika/article/view/441'
              className='font-semibold text-white hover:text-emerald-300 underline underline-offset-4'
              target='_blank'
              rel='noreferrer'
            >
              Jurnal Transformatika
            </Link>
            . Semua perhitungan Simple Additive Weighting (SAW) akan muncul bertahap agar rumus
            yang digunakan tetap transparan.
          </p>
          <div className='flex flex-wrap items-center gap-3 text-xs text-white/70 justify-center md:justify-start'>
            <span className='px-3 py-1 rounded-full border border-white/20 bg-white/5'>Input → Normalisasi → Pembobotan → Ranking</span>
            <button
              type='button'
              onClick={resetDefaults}
              className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white transition hover:border-white'
            >
              <FaRotateLeft /> Muat ulang contoh data
            </button>
          </div>
        </div>

        <SectionCard
          title='Kriteria & Bobot'
          description='Atur prioritas dan tipe kriteria (maksimasi atau minimasi). Bobot otomatis dinormalisasi.'
          actions={
            <button
              type='button'
              onClick={addCriterion}
              className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:border-white'
            >
              <FaPlus /> Tambah Kriteria
            </button>
          }
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Nama Kriteria</th>
                  <th className='px-4 py-3 text-left font-semibold'>Bobot</th>
                  <th className='px-4 py-3 text-left font-semibold'>Tipe (Max/Min)</th>
                  <th className='px-4 py-3 text-left font-semibold'>Hapus</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {criteria.map((criterion) => (
                  <tr key={criterion.id}>
                    <td className='px-4 py-3'>
                      <input
                        value={criterion.name}
                        onChange={(event) => updateCriterion(criterion.id, { name: event.target.value })}
                        className='w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm focus:border-white focus:outline-none'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        inputMode='decimal'
                        value={weightInputs[criterion.id] ?? criterion.weight.toString()}
                        onChange={(event) => handleWeightChange(criterion.id, event.target.value)}
                        onBlur={() => handleWeightBlur(criterion.id)}
                        className='w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm focus:border-white focus:outline-none'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <select
                        value={criterion.type}
                        onChange={(event) => handleTypeChange(criterion.id, event.target.value)}
                        className='w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm focus:border-white focus:outline-none'
                      >
                        <option value='max'>Benefit (Max)</option>
                        <option value='min'>Cost (Min)</option>
                      </select>
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <button
                        type='button'
                        disabled={!canRemoveCriterion}
                        onClick={() => removeCriterion(criterion.id)}
                        className='inline-flex items-center justify-center rounded-xl border border-red-400/50 px-3 py-2 text-red-200 transition hover:border-red-200 hover:text-red-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30'
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title='Alternatif & Nilai Fuzzy'
          description='Setiap kolom nilai menggunakan skala fuzzy (SR, R, S, T, ST) berupa angka 0 sampai 1.'
          actions={
            <button
              type='button'
              onClick={addAlternative}
              className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:border-white'
            >
              <FaPlus /> Tambah Alternatif
            </button>
          }
        >
          <div className='space-y-6'>
            {alternatives.map((alternative) => (
              <div
                key={alternative.id}
                className='rounded-3xl border border-white/10 bg-black/20 p-5 shadow-inner shadow-black/20'
              >
                <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
                  <input
                    value={alternative.name}
                    onChange={(event) => updateAlternativeName(alternative.id, event.target.value)}
                    className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-base font-semibold focus:border-white focus:outline-none md:max-w-sm'
                  />
                  <button
                    type='button'
                    disabled={!canRemoveAlternative}
                    onClick={() => removeAlternative(alternative.id)}
                    className='inline-flex items-center gap-2 rounded-2xl border border-red-400/50 px-4 py-2 text-sm text-red-200 hover:border-red-200 hover:text-red-100 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30'
                  >
                    <FaTrash /> Hapus Alternatif
                  </button>
                </div>
                <div className='mt-4 grid gap-4 md:grid-cols-2'>
                  {criteria.map((criterion) => {
                    const value = alternative.values[criterion.id] ?? 0;
                    return (
                      <div
                        key={`${alternative.id}-${criterion.id}`}
                        className='rounded-2xl border border-white/10 bg-white/5 p-4'
                      >
                        <p className='text-sm font-semibold text-white'>{criterion.name}</p>
                        <p className='text-xs text-white/70'>
                          Fuzzy {criterion.type === 'max' ? 'Benefit' : 'Cost'}
                        </p>
                        <div className='mt-3'>
                          <label className='flex flex-col text-xs text-white/70'>
                            <span className='mb-1 font-semibold'>Nilai Fuzzy (0 - 1)</span>
                            <div className='relative'>
                              <select
                                value={value.toString()}
                                onChange={(event) =>
                                  updateAlternativeValue(
                                    alternative.id,
                                    criterion.id,
                                    Number(event.target.value),
                                  )
                                }
                                className='w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 pr-9 text-sm text-white focus:border-white focus:outline-none'
                              >
                                <option value='0'>0 (SR)</option>
                                <option value='0.25'>0.25 (R)</option>
                                <option value='0.5'>0.5 (S)</option>
                                <option value='0.75'>0.75 (T)</option>
                                <option value='1'>1 (ST)</option>
                              </select>
                              <FaChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/60' />
                            </div>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title='Transparansi Rumus'
          description='Setiap tahap mengikuti Fuzzy SAW: normalisasi matriks fuzzy, pembobotan, lalu penjumlahan skor akhir.'
        >
          <div className='grid gap-4 md:grid-cols-2'>
            <FormulaBlock label='Normalisasi Benefit' formula='r_ij = x_ij / max(x_ij)' />
            <FormulaBlock label='Normalisasi Cost' formula='r_ij = min(x_ij) / x_ij' />
            <FormulaBlock label='Bobot Normalisasi' formula='w_j = w_j / Σ w_j' />
            <FormulaBlock label='Skor Akhir' formula='S_i = Σ (w_j * r_ij)' />
          </div>
        </SectionCard>

        <SectionCard
          title='Rekap Bobot'
          description='Bobot asli dan bobot normalisasi yang digunakan pada tahap pembobotan.'
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Kriteria</th>
                  <th className='px-4 py-3 text-left font-semibold'>Bobot Input</th>
                  <th className='px-4 py-3 text-left font-semibold'>Bobot Normalisasi</th>
                  <th className='px-4 py-3 text-left font-semibold'>Tipe</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {results.weightSummary.map((weight) => (
                  <tr key={weight.id}>
                    <td className='px-4 py-3 font-semibold'>{weight.name}</td>
                    <td className='px-4 py-3'>{weight.rawWeight.toFixed(3)}</td>
                    <td className='px-4 py-3'>{weight.normalizedWeight.toFixed(3)}</td>
                    <td className='px-4 py-3 uppercase'>{weight.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title='Matriks Fuzzy Awal'
          description='Nilai fuzzy setiap alternatif terhadap kriteria sebelum normalisasi.'
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Alternatif</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id} className='px-4 py-3 text-left font-semibold'>
                      {criterion.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {results.decisionMatrix.map((row) => (
                  <tr key={row.alternativeId}>
                    <td className='px-4 py-3 font-semibold'>{row.alternativeName}</td>
                    {criteria.map((criterion) => (
                      <td key={criterion.id} className='px-4 py-3 font-mono text-xs'>
                        {formatScalarValue(row.values[criterion.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title='Normalisasi Fuzzy'
          description='Nilai hasil normalisasi berdasarkan tipe benefit/cost.'
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Alternatif</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id} className='px-4 py-3 text-left font-semibold'>
                      {criterion.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {results.normalizedMatrix.map((row) => (
                  <tr key={row.alternativeId}>
                    <td className='px-4 py-3 font-semibold'>{row.alternativeName}</td>
                    {criteria.map((criterion) => (
                      <td key={criterion.id} className='px-4 py-3 font-mono text-xs'>
                        {formatScalarValue(row.values[criterion.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title='Pembobotan Normalisasi'
          description='Matriks normalisasi setelah dikalikan bobot setiap kriteria.'
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Alternatif</th>
                  {criteria.map((criterion) => (
                    <th key={criterion.id} className='px-4 py-3 text-left font-semibold'>
                      {criterion.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {results.weightedMatrix.map((row) => (
                  <tr key={row.alternativeId}>
                    <td className='px-4 py-3 font-semibold'>{row.alternativeName}</td>
                    {criteria.map((criterion) => (
                      <td key={criterion.id} className='px-4 py-3 font-mono text-xs'>
                        {formatScalarValue(row.values[criterion.id])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title='Referensi Normalisasi'
          description='Nilai maksimum/minimum yang dipakai untuk normalisasi masing-masing kriteria.'
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Kriteria</th>
                  <th className='px-4 py-3 text-left font-semibold'>Tipe</th>
                  <th className='px-4 py-3 text-left font-semibold'>Max</th>
                  <th className='px-4 py-3 text-left font-semibold'>Min</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {criteria.map((criterion) => {
                  const reference = results.normalizationReferences[criterion.id];
                  return (
                    <tr key={criterion.id}>
                      <td className='px-4 py-3 font-semibold'>{criterion.name}</td>
                      <td className='px-4 py-3 uppercase'>{criterion.type}</td>
                      <td className='px-4 py-3 font-mono text-xs'>
                        {reference ? formatScalarValue(reference.max) : '-'}
                      </td>
                      <td className='px-4 py-3 font-mono text-xs'>
                        {reference ? formatScalarValue(reference.min) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title='Ranking Akhir'
          description='Skor akhir digunakan untuk menentukan prioritas berdasarkan nilai terbesar.'
        >
          <div className='overflow-x-auto rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead className='bg-white/5 text-xs uppercase tracking-wider text-white/70'>
                <tr>
                  <th className='px-4 py-3 text-left font-semibold'>Peringkat</th>
                  <th className='px-4 py-3 text-left font-semibold'>Alternatif</th>
                  <th className='px-4 py-3 text-left font-semibold'>Skor Akhir</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {results.ranking.map((row, index) => (
                  <tr key={row.alternativeId} className={index === 0 ? 'bg-emerald-500/10' : ''}>
                    <td className='px-4 py-3 font-semibold'>{index + 1}</td>
                    <td className='px-4 py-3 font-semibold'>{row.alternativeName}</td>
                    <td className='px-4 py-3 font-semibold'>{row.score.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
        <p className='text-xs text-white/60 text-center md:text-right'>
          Perlu narasi interpretasi SAW?{' '}
          <Link
            href={{
              pathname: '/fsaw-detection/interpretasi',
              query: { data: JSON.stringify(results.ranking) },
            }}
            className='font-semibold text-white hover:text-emerald-300 underline underline-offset-4'
          >
            Lihat penjelasan fuzzy
          </Link>
        </p>
      </div>
    </div>
  );
};

export default FsawDetectionClient;
