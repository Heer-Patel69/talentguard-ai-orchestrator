export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          ai_confidence: number | null
          applied_at: string
          candidate_id: string
          current_round: number | null
          fraud_flags: Json | null
          id: string
          job_id: string
          notes: string | null
          overall_score: number | null
          status: Database["public"]["Enums"]["application_status"] | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          applied_at?: string
          candidate_id: string
          current_round?: number | null
          fraud_flags?: Json | null
          id?: string
          job_id: string
          notes?: string | null
          overall_score?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          applied_at?: string
          candidate_id?: string
          current_round?: number | null
          fraud_flags?: Json | null
          id?: string
          job_id?: string
          notes?: string | null
          overall_score?: number | null
          status?: Database["public"]["Enums"]["application_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_demographics: {
        Row: {
          age_group: string | null
          candidate_id: string
          created_at: string
          educational_institution: string | null
          gender: string | null
          geographic_region: string | null
          id: string
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          age_group?: string | null
          candidate_id: string
          created_at?: string
          educational_institution?: string | null
          gender?: string | null
          geographic_region?: string | null
          id?: string
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          age_group?: string | null
          candidate_id?: string
          created_at?: string
          educational_institution?: string | null
          gender?: string | null
          geographic_region?: string | null
          id?: string
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: []
      }
      candidate_profiles: {
        Row: {
          aadhaar_back_url: string | null
          aadhaar_front_url: string | null
          aadhaar_number: string | null
          created_at: string
          github_url: string | null
          id: string
          linkedin_url: string | null
          live_photo_url: string | null
          phone_number: string
          resume_url: string | null
          updated_at: string
          user_id: string
          verification_confidence: number | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          aadhaar_number?: string | null
          created_at?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          live_photo_url?: string | null
          phone_number: string
          resume_url?: string | null
          updated_at?: string
          user_id: string
          verification_confidence?: number | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          aadhaar_back_url?: string | null
          aadhaar_front_url?: string | null
          aadhaar_number?: string | null
          created_at?: string
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          live_photo_url?: string | null
          phone_number?: string
          resume_url?: string | null
          updated_at?: string
          user_id?: string
          verification_confidence?: number | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      candidate_scores: {
        Row: {
          application_id: string
          candidate_id: string
          communication_score: number | null
          created_at: string
          final_score: number | null
          id: string
          improvement_suggestions: string[] | null
          job_id: string
          overall_summary: string | null
          percentile_rank: number | null
          problem_solving_score: number | null
          rank_among_applicants: number | null
          recommendation:
            | Database["public"]["Enums"]["decision_recommendation"]
            | null
          recommendation_confidence: number | null
          recommendation_reason: string | null
          risk_explanations: string[] | null
          risk_flags: string[] | null
          strengths: string[] | null
          technical_score: number | null
          total_applicants: number | null
          updated_at: string
          weaknesses: string[] | null
        }
        Insert: {
          application_id: string
          candidate_id: string
          communication_score?: number | null
          created_at?: string
          final_score?: number | null
          id?: string
          improvement_suggestions?: string[] | null
          job_id: string
          overall_summary?: string | null
          percentile_rank?: number | null
          problem_solving_score?: number | null
          rank_among_applicants?: number | null
          recommendation?:
            | Database["public"]["Enums"]["decision_recommendation"]
            | null
          recommendation_confidence?: number | null
          recommendation_reason?: string | null
          risk_explanations?: string[] | null
          risk_flags?: string[] | null
          strengths?: string[] | null
          technical_score?: number | null
          total_applicants?: number | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Update: {
          application_id?: string
          candidate_id?: string
          communication_score?: number | null
          created_at?: string
          final_score?: number | null
          id?: string
          improvement_suggestions?: string[] | null
          job_id?: string
          overall_summary?: string | null
          percentile_rank?: number | null
          problem_solving_score?: number | null
          rank_among_applicants?: number | null
          recommendation?:
            | Database["public"]["Enums"]["decision_recommendation"]
            | null
          recommendation_confidence?: number | null
          recommendation_reason?: string | null
          risk_explanations?: string[] | null
          risk_flags?: string[] | null
          strengths?: string[] | null
          technical_score?: number | null
          total_applicants?: number | null
          updated_at?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_scores_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_scores_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_overrides: {
        Row: {
          application_id: string
          created_at: string
          id: string
          interviewer_id: string
          new_status: Database["public"]["Enums"]["application_status"]
          original_status: Database["public"]["Enums"]["application_status"]
          reason: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          interviewer_id: string
          new_status: Database["public"]["Enums"]["application_status"]
          original_status: Database["public"]["Enums"]["application_status"]
          reason: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          interviewer_id?: string
          new_status?: Database["public"]["Enums"]["application_status"]
          original_status?: Database["public"]["Enums"]["application_status"]
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_overrides_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      fairness_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          category: Database["public"]["Enums"]["demographic_category"]
          created_at: string
          description: string
          deviation_percentage: number | null
          group_name: string
          id: string
          job_id: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: Database["public"]["Enums"]["alert_status"]
          suggested_actions: Json | null
          threshold_percentage: number | null
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          category: Database["public"]["Enums"]["demographic_category"]
          created_at?: string
          description: string
          deviation_percentage?: number | null
          group_name: string
          id?: string
          job_id: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: Database["public"]["Enums"]["alert_status"]
          suggested_actions?: Json | null
          threshold_percentage?: number | null
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          category?: Database["public"]["Enums"]["demographic_category"]
          created_at?: string
          description?: string
          deviation_percentage?: number | null
          group_name?: string
          id?: string
          job_id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: Database["public"]["Enums"]["alert_status"]
          suggested_actions?: Json | null
          threshold_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      fairness_audit_reports: {
        Row: {
          compliance_status: string
          created_at: string
          findings: Json | null
          generated_at: string
          id: string
          interviewer_id: string
          job_id: string | null
          metrics_snapshot: Json | null
          overall_fairness_score: number | null
          recommendations: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          total_candidates_analyzed: number
        }
        Insert: {
          compliance_status?: string
          created_at?: string
          findings?: Json | null
          generated_at?: string
          id?: string
          interviewer_id: string
          job_id?: string | null
          metrics_snapshot?: Json | null
          overall_fairness_score?: number | null
          recommendations?: Json | null
          report_period_end: string
          report_period_start: string
          report_type: string
          total_candidates_analyzed?: number
        }
        Update: {
          compliance_status?: string
          created_at?: string
          findings?: Json | null
          generated_at?: string
          id?: string
          interviewer_id?: string
          job_id?: string | null
          metrics_snapshot?: Json | null
          overall_fairness_score?: number | null
          recommendations?: Json | null
          report_period_end?: string
          report_period_start?: string
          report_type?: string
          total_candidates_analyzed?: number
        }
        Relationships: []
      }
      fairness_metrics: {
        Row: {
          analysis_date: string
          average_score: number | null
          category: Database["public"]["Enums"]["demographic_category"]
          chi_squared_value: number | null
          created_at: string
          disparate_impact_ratio: number | null
          group_name: string
          id: string
          is_statistically_significant: boolean | null
          job_id: string
          p_value: number | null
          pass_rate: number | null
          passed_candidates: number
          score_std_deviation: number | null
          total_candidates: number
          updated_at: string
        }
        Insert: {
          analysis_date?: string
          average_score?: number | null
          category: Database["public"]["Enums"]["demographic_category"]
          chi_squared_value?: number | null
          created_at?: string
          disparate_impact_ratio?: number | null
          group_name: string
          id?: string
          is_statistically_significant?: boolean | null
          job_id: string
          p_value?: number | null
          pass_rate?: number | null
          passed_candidates?: number
          score_std_deviation?: number | null
          total_candidates?: number
          updated_at?: string
        }
        Update: {
          analysis_date?: string
          average_score?: number | null
          category?: Database["public"]["Enums"]["demographic_category"]
          chi_squared_value?: number | null
          created_at?: string
          disparate_impact_ratio?: number | null
          group_name?: string
          id?: string
          is_statistically_significant?: boolean | null
          job_id?: string
          p_value?: number | null
          pass_rate?: number | null
          passed_candidates?: number
          score_std_deviation?: number | null
          total_candidates?: number
          updated_at?: string
        }
        Relationships: []
      }
      fairness_settings: {
        Row: {
          alert_dashboard_enabled: boolean
          alert_email_enabled: boolean
          auto_monthly_audit: boolean
          created_at: string
          disparate_impact_threshold: number
          enable_blind_evaluation: boolean
          enable_score_reweighting: boolean
          id: string
          interviewer_id: string
          job_id: string | null
          pass_rate_deviation_threshold: number
          reweighting_factors: Json | null
          updated_at: string
        }
        Insert: {
          alert_dashboard_enabled?: boolean
          alert_email_enabled?: boolean
          auto_monthly_audit?: boolean
          created_at?: string
          disparate_impact_threshold?: number
          enable_blind_evaluation?: boolean
          enable_score_reweighting?: boolean
          id?: string
          interviewer_id: string
          job_id?: string | null
          pass_rate_deviation_threshold?: number
          reweighting_factors?: Json | null
          updated_at?: string
        }
        Update: {
          alert_dashboard_enabled?: boolean
          alert_email_enabled?: boolean
          auto_monthly_audit?: boolean
          created_at?: string
          disparate_impact_threshold?: number
          enable_blind_evaluation?: boolean
          enable_score_reweighting?: boolean
          id?: string
          interviewer_id?: string
          job_id?: string | null
          pass_rate_deviation_threshold?: number
          reweighting_factors?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      interviewer_profiles: {
        Row: {
          budget_currency: string | null
          company_age: Database["public"]["Enums"]["company_age"]
          company_city: string
          company_country: string
          company_gst: string | null
          company_logo_url: string | null
          company_name: string
          company_state: string
          created_at: string
          hiring_reason: string | null
          id: string
          industry: Database["public"]["Enums"]["industry"]
          per_candidate_budget: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_currency?: string | null
          company_age: Database["public"]["Enums"]["company_age"]
          company_city: string
          company_country: string
          company_gst?: string | null
          company_logo_url?: string | null
          company_name: string
          company_state: string
          created_at?: string
          hiring_reason?: string | null
          id?: string
          industry: Database["public"]["Enums"]["industry"]
          per_candidate_budget?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_currency?: string | null
          company_age?: Database["public"]["Enums"]["company_age"]
          company_city?: string
          company_country?: string
          company_gst?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_state?: string
          created_at?: string
          hiring_reason?: string | null
          id?: string
          industry?: Database["public"]["Enums"]["industry"]
          per_candidate_budget?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_rounds: {
        Row: {
          ai_generate_questions: boolean | null
          created_at: string
          custom_questions: Json | null
          duration_minutes: number | null
          id: string
          job_id: string
          round_number: number
          round_type: Database["public"]["Enums"]["round_type"]
        }
        Insert: {
          ai_generate_questions?: boolean | null
          created_at?: string
          custom_questions?: Json | null
          duration_minutes?: number | null
          id?: string
          job_id: string
          round_number: number
          round_type: Database["public"]["Enums"]["round_type"]
        }
        Update: {
          ai_generate_questions?: boolean | null
          created_at?: string
          custom_questions?: Json | null
          duration_minutes?: number | null
          id?: string
          job_id?: string
          round_number?: number
          round_type?: Database["public"]["Enums"]["round_type"]
        }
        Relationships: [
          {
            foreignKeyName: "job_rounds_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_deadline: string | null
          auto_shortlist_count: number | null
          auto_shortlist_enabled: boolean | null
          created_at: string
          description: string | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          field: string
          id: string
          interviewer_id: string
          location_city: string | null
          location_type: Database["public"]["Enums"]["location_type"] | null
          num_rounds: number | null
          required_skills: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          status: Database["public"]["Enums"]["job_status"] | null
          title: string
          toughness_level: Database["public"]["Enums"]["toughness_level"] | null
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          auto_shortlist_count?: number | null
          auto_shortlist_enabled?: boolean | null
          created_at?: string
          description?: string | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          field: string
          id?: string
          interviewer_id: string
          location_city?: string | null
          location_type?: Database["public"]["Enums"]["location_type"] | null
          num_rounds?: number | null
          required_skills?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title: string
          toughness_level?:
            | Database["public"]["Enums"]["toughness_level"]
            | null
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          auto_shortlist_count?: number | null
          auto_shortlist_enabled?: boolean | null
          created_at?: string
          description?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          field?: string
          id?: string
          interviewer_id?: string
          location_city?: string | null
          location_type?: Database["public"]["Enums"]["location_type"] | null
          num_rounds?: number | null
          required_skills?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          title?: string
          toughness_level?:
            | Database["public"]["Enums"]["toughness_level"]
            | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_scores: {
        Row: {
          ai_evaluation: string | null
          ai_reasoning: string | null
          candidate_answer: string | null
          code_quality: number | null
          communication_clarity: number | null
          created_at: string
          hints_used: number | null
          id: string
          problem_solving: number | null
          question_number: number
          question_text: string
          round_result_id: string
          score_justification: string | null
          technical_accuracy: number | null
          time_efficiency: number | null
          time_taken_seconds: number | null
          weighted_score: number | null
        }
        Insert: {
          ai_evaluation?: string | null
          ai_reasoning?: string | null
          candidate_answer?: string | null
          code_quality?: number | null
          communication_clarity?: number | null
          created_at?: string
          hints_used?: number | null
          id?: string
          problem_solving?: number | null
          question_number: number
          question_text: string
          round_result_id: string
          score_justification?: string | null
          technical_accuracy?: number | null
          time_efficiency?: number | null
          time_taken_seconds?: number | null
          weighted_score?: number | null
        }
        Update: {
          ai_evaluation?: string | null
          ai_reasoning?: string | null
          candidate_answer?: string | null
          code_quality?: number | null
          communication_clarity?: number | null
          created_at?: string
          hints_used?: number | null
          id?: string
          problem_solving?: number | null
          question_number?: number
          question_text?: string
          round_result_id?: string
          score_justification?: string | null
          technical_accuracy?: number | null
          time_efficiency?: number | null
          time_taken_seconds?: number | null
          weighted_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "question_scores_round_result_id_fkey"
            columns: ["round_result_id"]
            isOneToOne: false
            referencedRelation: "round_results"
            referencedColumns: ["id"]
          },
        ]
      }
      round_results: {
        Row: {
          ai_explanation: string | null
          ai_feedback: string | null
          application_id: string
          code_submissions: Json | null
          completed_at: string | null
          created_at: string
          fraud_details: Json | null
          fraud_detected: boolean | null
          id: string
          recording_url: string | null
          round_id: string
          score: number | null
        }
        Insert: {
          ai_explanation?: string | null
          ai_feedback?: string | null
          application_id: string
          code_submissions?: Json | null
          completed_at?: string | null
          created_at?: string
          fraud_details?: Json | null
          fraud_detected?: boolean | null
          id?: string
          recording_url?: string | null
          round_id: string
          score?: number | null
        }
        Update: {
          ai_explanation?: string | null
          ai_feedback?: string | null
          application_id?: string
          code_submissions?: Json | null
          completed_at?: string | null
          created_at?: string
          fraud_details?: Json | null
          fraud_detected?: boolean | null
          id?: string
          recording_url?: string | null
          round_id?: string
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "round_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_results_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "job_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      round_scores: {
        Row: {
          application_id: string
          base_score: number | null
          clarifying_questions_bonus: number | null
          created_at: string
          edge_cases_bonus: number | null
          final_score: number | null
          fraud_penalty: number | null
          hints_penalty: number | null
          id: string
          improvement_suggestions: string[] | null
          optimization_bonus: number | null
          round_number: number
          round_result_id: string
          strengths: string[] | null
          updated_at: string
          weaknesses: string[] | null
          weight: number | null
        }
        Insert: {
          application_id: string
          base_score?: number | null
          clarifying_questions_bonus?: number | null
          created_at?: string
          edge_cases_bonus?: number | null
          final_score?: number | null
          fraud_penalty?: number | null
          hints_penalty?: number | null
          id?: string
          improvement_suggestions?: string[] | null
          optimization_bonus?: number | null
          round_number: number
          round_result_id: string
          strengths?: string[] | null
          updated_at?: string
          weaknesses?: string[] | null
          weight?: number | null
        }
        Update: {
          application_id?: string
          base_score?: number | null
          clarifying_questions_bonus?: number | null
          created_at?: string
          edge_cases_bonus?: number | null
          final_score?: number | null
          fraud_penalty?: number | null
          hints_penalty?: number | null
          id?: string
          improvement_suggestions?: string[] | null
          optimization_bonus?: number | null
          round_number?: number
          round_result_id?: string
          strengths?: string[] | null
          updated_at?: string
          weaknesses?: string[] | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "round_scores_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "round_scores_round_result_id_fkey"
            columns: ["round_result_id"]
            isOneToOne: true
            referencedRelation: "round_results"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_audit_logs: {
        Row: {
          action_description: string
          action_type: string
          application_id: string | null
          candidate_id: string | null
          confidence_score: number | null
          created_at: string
          decision_made: string | null
          factors_considered: Json | null
          id: string
          job_id: string | null
          model_version: string | null
          triggered_by: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          application_id?: string | null
          candidate_id?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_made?: string | null
          factors_considered?: Json | null
          id?: string
          job_id?: string | null
          model_version?: string | null
          triggered_by?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          application_id?: string | null
          candidate_id?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_made?: string | null
          factors_considered?: Json | null
          id?: string
          job_id?: string | null
          model_version?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scoring_audit_logs_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scoring_audit_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      alert_status: "active" | "acknowledged" | "resolved" | "dismissed"
      app_role: "interviewer" | "candidate"
      application_status:
        | "applied"
        | "screening"
        | "interviewing"
        | "shortlisted"
        | "rejected"
        | "hired"
        | "withdrawn"
      company_age: "less_than_1" | "1_to_5" | "5_to_10" | "more_than_10"
      decision_recommendation: "shortlist" | "maybe" | "reject"
      demographic_category:
        | "gender"
        | "region"
        | "institution"
        | "experience"
        | "age_group"
      experience_level: "fresher" | "junior" | "mid" | "senior" | "architect"
      industry:
        | "it"
        | "finance"
        | "healthcare"
        | "education"
        | "manufacturing"
        | "retail"
        | "real_estate"
        | "consulting"
        | "legal"
        | "other"
      job_status: "draft" | "active" | "closed" | "paused"
      location_type: "remote" | "hybrid" | "onsite"
      round_type:
        | "mcq"
        | "coding"
        | "system_design"
        | "behavioral"
        | "live_ai_interview"
      toughness_level: "easy" | "medium" | "hard" | "expert"
      verification_status: "pending" | "verified" | "rejected" | "manual_review"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_status: ["active", "acknowledged", "resolved", "dismissed"],
      app_role: ["interviewer", "candidate"],
      application_status: [
        "applied",
        "screening",
        "interviewing",
        "shortlisted",
        "rejected",
        "hired",
        "withdrawn",
      ],
      company_age: ["less_than_1", "1_to_5", "5_to_10", "more_than_10"],
      decision_recommendation: ["shortlist", "maybe", "reject"],
      demographic_category: [
        "gender",
        "region",
        "institution",
        "experience",
        "age_group",
      ],
      experience_level: ["fresher", "junior", "mid", "senior", "architect"],
      industry: [
        "it",
        "finance",
        "healthcare",
        "education",
        "manufacturing",
        "retail",
        "real_estate",
        "consulting",
        "legal",
        "other",
      ],
      job_status: ["draft", "active", "closed", "paused"],
      location_type: ["remote", "hybrid", "onsite"],
      round_type: [
        "mcq",
        "coding",
        "system_design",
        "behavioral",
        "live_ai_interview",
      ],
      toughness_level: ["easy", "medium", "hard", "expert"],
      verification_status: ["pending", "verified", "rejected", "manual_review"],
    },
  },
} as const
