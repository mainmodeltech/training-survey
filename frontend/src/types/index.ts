export type FormStep = 1 | 2 | 3 | 4 | 5;

export interface FeatureUsage {
  [feature: string]: "jamais" | "parfois" | "souvent";
}

export interface FormData {
  // Step 1
  full_name: string;
  position: string;
  department: string;
  location: string;

  // Step 2
  self_level: "debutant" | "intermediaire" | "avance" | "expert" | "";
  features_usage: FeatureUsage;
  file_size: string;

  // Step 3
  daily_tasks: string[];
  daily_time: string;
  difficulties: string[];
  difficulty_details: string;

  // Step 4
  motivation: string;
  expected_results: string[];
  ambition_level: string;

  // Step 5
  preferred_duration: string;
  preferred_modality: string;
  has_computer: string;
  concrete_case: string;
  additional_comments: string;
}

export interface SubmissionResult {
  id: number;
  full_name: string;
  computed_level: "A" | "B";
  score_total: number;
  recommended_label: string;
  recommended_duration: string;
  key_topics: string[];
  message: string;
}

export interface AdminUser {
  username: string;
  is_superadmin: boolean;
}

export interface AuthState {
  token: string | null;
  user: AdminUser | null;
}

export interface SubmissionListItem {
  id: number;
  full_name: string;
  position: string;
  department: string;
  location: string;
  self_level: string;
  computed_level: "A" | "B";
  score_total: number;
  preferred_duration: string;
  preferred_modality: string;
  reviewed: boolean;
  created_at: string;
}

export interface Stats {
  total_submissions: number;
  level_a_count: number;
  level_b_count: number;
  reviewed_count: number;
  pending_count: number;
  avg_score: number;
  by_self_level: { level: string; count: number }[];
  by_modality: { modality: string; count: number }[];
  by_duration: { duration: string; count: number }[];
}
