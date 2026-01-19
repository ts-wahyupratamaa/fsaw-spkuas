export type CriterionType = 'max' | 'min';

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  type: CriterionType;
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, number>;
}

export interface WeightSummary {
  id: string;
  name: string;
  rawWeight: number;
  normalizedWeight: number;
  type: CriterionType;
}

export interface MatrixRow {
  alternativeId: string;
  alternativeName: string;
  values: Record<string, number>;
}

export interface AggregatedScore {
  alternativeId: string;
  alternativeName: string;
  score: number;
}

export interface NormalizationReference {
  criterionId: string;
  criterionName: string;
  max: number;
  min: number;
  type: CriterionType;
}

export interface FuzzySawResult {
  weightSummary: WeightSummary[];
  decisionMatrix: MatrixRow[];
  normalizedMatrix: MatrixRow[];
  weightedMatrix: MatrixRow[];
  aggregatedScores: AggregatedScore[];
  ranking: AggregatedScore[];
  normalizationReferences: Record<string, NormalizationReference>;
}

const ensureValue = (value?: number): number => value ?? 0;

const safeDivide = (numerator: number, denominator: number): number => {
  if (denominator === 0) {
    return 0;
  }

  return parseFloat((numerator / denominator).toFixed(6));
};

const buildNormalizationReference = (
  criteria: Criterion[],
  alternatives: Alternative[],
): Record<string, NormalizationReference> => {
  return criteria.reduce<Record<string, NormalizationReference>>((acc, criterion) => {
    const values = alternatives.map((alt) => ensureValue(alt.values[criterion.id]));

    if (values.length === 0) {
      acc[criterion.id] = {
        criterionId: criterion.id,
        criterionName: criterion.name,
        max: 0,
        min: 0,
        type: criterion.type,
      };

      return acc;
    }

    acc[criterion.id] = {
      criterionId: criterion.id,
      criterionName: criterion.name,
      max: Math.max(...values),
      min: Math.min(...values),
      type: criterion.type,
    };

    return acc;
  }, {});
};

const normalizeValue = (
  value: number,
  reference: NormalizationReference,
): number => {
  if (reference.type === 'max') {
    return reference.max === 0 ? 0 : safeDivide(value, reference.max);
  }

  return value === 0 ? 0 : safeDivide(reference.min, value);
};

export const calculateFuzzySaw = (
  criteria: Criterion[],
  alternatives: Alternative[],
): FuzzySawResult => {
  const decisionMatrix: MatrixRow[] = alternatives.map((alternative) => ({
    alternativeId: alternative.id,
    alternativeName: alternative.name,
    values: criteria.reduce<Record<string, number>>((acc, criterion) => {
      acc[criterion.id] = ensureValue(alternative.values[criterion.id]);
      return acc;
    }, {}),
  }));

  const weightSum = criteria.reduce((total, criterion) => total + criterion.weight, 0);
  const normalizedWeightFallback = criteria.length === 0 ? 0 : 1 / criteria.length;

  const weightSummary: WeightSummary[] = criteria.map((criterion) => {
    const normalizedWeight =
      weightSum === 0
        ? normalizedWeightFallback
        : parseFloat((criterion.weight / weightSum).toFixed(6));

    return {
      id: criterion.id,
      name: criterion.name,
      rawWeight: parseFloat(criterion.weight.toString()),
      normalizedWeight,
      type: criterion.type,
    };
  });

  const weightMap = weightSummary.reduce<Record<string, number>>((acc, summary) => {
    acc[summary.id] = summary.normalizedWeight;
    return acc;
  }, {});

  const normalizationReferences = buildNormalizationReference(criteria, alternatives);

  const normalizedMatrix: MatrixRow[] = decisionMatrix.map((row) => ({
    alternativeId: row.alternativeId,
    alternativeName: row.alternativeName,
    values: Object.entries(row.values).reduce<Record<string, number>>(
      (acc, [criterionId, value]) => {
        const reference = normalizationReferences[criterionId];
        acc[criterionId] = normalizeValue(value, reference);
        return acc;
      },
      {},
    ),
  }));

  const weightedMatrix: MatrixRow[] = normalizedMatrix.map((row) => ({
    alternativeId: row.alternativeId,
    alternativeName: row.alternativeName,
    values: Object.entries(row.values).reduce<Record<string, number>>(
      (acc, [criterionId, value]) => {
        const weight = weightMap[criterionId] ?? normalizedWeightFallback;
        acc[criterionId] = parseFloat((value * weight).toFixed(6));
        return acc;
      },
      {},
    ),
  }));

  const aggregatedScores: AggregatedScore[] = weightedMatrix.map((row) => {
    const score = parseFloat(
      Object.values(row.values)
        .reduce((acc, value) => acc + value, 0)
        .toFixed(6),
    );

    return {
      alternativeId: row.alternativeId,
      alternativeName: row.alternativeName,
      score,
    };
  });

  const ranking = [...aggregatedScores].sort((a, b) => b.score - a.score);

  return {
    weightSummary,
    decisionMatrix,
    normalizedMatrix,
    weightedMatrix,
    aggregatedScores,
    ranking,
    normalizationReferences,
  };
};

export const formatScalarValue = (value: number): string => value.toFixed(3);
