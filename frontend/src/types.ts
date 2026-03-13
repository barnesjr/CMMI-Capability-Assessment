// Score constants
export const SCORE_LABELS: Record<number, string> = {
  1: "Initial",
  2: "Managed",
  3: "Defined",
  4: "Quantitatively Managed",
  5: "Optimizing",
};

export const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

export const MATURITY_BANDS = [
  { min: 1.0, max: 1.5, label: "Initial", color: "#ef4444" },
  { min: 1.5, max: 2.5, label: "Managed", color: "#f97316" },
  { min: 2.5, max: 3.5, label: "Defined", color: "#eab308" },
  { min: 3.5, max: 4.5, label: "Quantitatively Managed", color: "#84cc16" },
  { min: 4.5, max: 5.0, label: "Optimizing", color: "#22c55e" },
] as const;

export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  balanced: {
    label: "Balanced",
    weights: { est: 0.05, plan: 0.05, mc: 0.05, rdm: 0.05, ts: 0.05, pi: 0.05, vv: 0.05, sam: 0.05, rsk: 0.05, dar: 0.05, cm: 0.05, car: 0.05, pqa: 0.05, ot: 0.05, gov: 0.05, ii: 0.05, pad: 0.05, mpm: 0.05, pcm: 0.05, opf: 0.05 },
  },
  delivery_focused: {
    label: "Delivery-Focused",
    weights: { est: 0.07, plan: 0.08, mc: 0.07, rdm: 0.08, ts: 0.08, pi: 0.07, vv: 0.07, sam: 0.04, rsk: 0.05, dar: 0.04, cm: 0.04, car: 0.03, pqa: 0.04, ot: 0.03, gov: 0.03, ii: 0.03, pad: 0.03, mpm: 0.04, pcm: 0.04, opf: 0.04 },
  },
  quality_focused: {
    label: "Quality-Focused",
    weights: { est: 0.04, plan: 0.04, mc: 0.05, rdm: 0.06, ts: 0.05, pi: 0.05, vv: 0.08, sam: 0.04, rsk: 0.06, dar: 0.06, cm: 0.06, car: 0.07, pqa: 0.08, ot: 0.04, gov: 0.04, ii: 0.03, pad: 0.04, mpm: 0.05, pcm: 0.03, opf: 0.03 },
  },
  risk_focused: {
    label: "Risk-Focused",
    weights: { est: 0.04, plan: 0.05, mc: 0.07, rdm: 0.05, ts: 0.04, pi: 0.04, vv: 0.06, sam: 0.06, rsk: 0.08, dar: 0.07, cm: 0.06, car: 0.06, pqa: 0.06, ot: 0.03, gov: 0.06, ii: 0.03, pad: 0.03, mpm: 0.05, pcm: 0.03, opf: 0.03 },
  },
};

export function getMaturityBand(score: number): { label: string; color: string } {
  for (let i = 0; i < MATURITY_BANDS.length; i++) {
    const band = MATURITY_BANDS[i];
    const isLast = i === MATURITY_BANDS.length - 1;
    if (score >= band.min && (isLast ? score <= band.max : score < band.max)) {
      return { label: band.label, color: band.color };
    }
  }
  return { label: MATURITY_BANDS[MATURITY_BANDS.length - 1].label, color: MATURITY_BANDS[MATURITY_BANDS.length - 1].color };
}

// Assessment interfaces — mirror backend models
export interface EvidenceReference {
  document: string;
  section: string;
  date: string;
}

export interface AssessmentItem {
  id: string;
  text: string;
  score: number | null;
  na: boolean;
  na_justification: string | null;
  confidence: string | null;
  notes: string;
  evidence_references: EvidenceReference[];
  attachments: string[];
}

export interface CapabilityArea {
  id: string;
  name: string;
  items: AssessmentItem[];
}

// Grouped hierarchy
export interface PracticeArea {
  id: string;
  name: string;
  weight: number;
  capability_areas: CapabilityArea[];
}

export interface CategoryGroup {
  id: string;
  name: string;
  practice_areas: PracticeArea[];
}

// CMMI-SVC Extension
export interface SvcSection {
  id: string;
  name: string;
  capability_areas: CapabilityArea[];
}

export interface SvcExtension {
  enabled: boolean;
  sections: SvcSection[];
}

// Framework read-only interfaces
export interface FrameworkItem {
  id: string;
  text: string;
  rubric: Record<string, string>;
}

export interface FrameworkCapabilityArea {
  id: string;
  name: string;
  items: FrameworkItem[];
}

export interface FrameworkPracticeArea {
  id: string;
  name: string;
  weight: number;
  capability_areas: FrameworkCapabilityArea[];
}

export interface FrameworkCategoryGroup {
  id: string;
  name: string;
  practice_areas: FrameworkPracticeArea[];
}

export interface FrameworkSvcSection {
  id: string;
  name: string;
  capability_areas: FrameworkCapabilityArea[];
}

export interface Framework {
  version: string;
  framework_alignment: string;
  category_groups: FrameworkCategoryGroup[];
  svc_extension?: {
    sections: FrameworkSvcSection[];
  };
  weighting_models: Record<string, { label: string; weights: Record<string, number> }>;
}

// Shared models
export interface ClientInfo {
  name: string;
  industry: string;
  assessment_date: string;
  assessor: string;
}

export interface AssessmentMetadata {
  framework_version: string;
  tool_version: string;
  last_modified: string;
}

export interface ScoringConfig {
  weighting_model: string;
  practice_area_weights: Record<string, number>;
  custom_weights: Record<string, number> | null;
}

export interface AssessmentData {
  client_info: ClientInfo;
  assessment_metadata: AssessmentMetadata;
  scoring_config: ScoringConfig;
  category_groups: CategoryGroup[];
  svc_enabled: boolean;
  svc_extension: SvcExtension | null;
  target_scores: Record<string, number>;
}
