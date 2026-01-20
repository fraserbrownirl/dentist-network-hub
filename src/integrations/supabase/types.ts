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
      ai_generated_content: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          opening_message: string | null
          page_summary: string | null
          talking_points: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          opening_message?: string | null
          page_summary?: string | null
          talking_points?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          opening_message?: string | null
          page_summary?: string | null
          talking_points?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_content_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "business_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      authority_signals: {
        Row: {
          computed_at: string
          confidence: number
          id: string
          lead_id: string
          source: string
          statement: string
          type: string
          unit: string | null
          value: number | null
        }
        Insert: {
          computed_at?: string
          confidence: number
          id?: string
          lead_id: string
          source: string
          statement: string
          type: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          computed_at?: string
          confidence?: number
          id?: string
          lead_id?: string
          source?: string
          statement?: string
          type?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "authority_signals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "business_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      business_leads: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          description: string | null
          google_url: string | null
          id: string
          job_id: string
          name: string | null
          phone_number: string | null
          place_id: string
          rating: number | null
          reviews_count: number | null
          services_provided: string[] | null
          top_reviews: Json | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          google_url?: string | null
          id?: string
          job_id: string
          name?: string | null
          phone_number?: string | null
          place_id: string
          rating?: number | null
          reviews_count?: number | null
          services_provided?: string[] | null
          top_reviews?: Json | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          google_url?: string | null
          id?: string
          job_id?: string
          name?: string | null
          phone_number?: string | null
          place_id?: string
          rating?: number | null
          reviews_count?: number | null
          services_provided?: string[] | null
          top_reviews?: Json | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_leads_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lead_extraction_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          json_data: Json | null
          meta_description: string | null
          meta_title: string | null
          name: string
          slug: string
          state: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          json_data?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          slug: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          json_data?: Json | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          slug?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      comparative_positioning: {
        Row: {
          computed_at: string
          id: string
          lead_id: string
          metric: string
          peer_count: number
          percentile: number | null
          scope: string
          statement: string
          threshold_met: boolean
        }
        Insert: {
          computed_at?: string
          id?: string
          lead_id: string
          metric: string
          peer_count: number
          percentile?: number | null
          scope: string
          statement: string
          threshold_met?: boolean
        }
        Update: {
          computed_at?: string
          id?: string
          lead_id?: string
          metric?: string
          peer_count?: number
          percentile?: number | null
          scope?: string
          statement?: string
          threshold_met?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comparative_positioning_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "business_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      content_integrity: {
        Row: {
          checked_at: string
          generation_id: string | null
          id: string
          lead_id: string
          max_similarity: number
          rewrite_mode: string
          source_hash: string
          status: string
          worst_chunk_pair: Json | null
        }
        Insert: {
          checked_at?: string
          generation_id?: string | null
          id?: string
          lead_id: string
          max_similarity: number
          rewrite_mode: string
          source_hash: string
          status?: string
          worst_chunk_pair?: Json | null
        }
        Update: {
          checked_at?: string
          generation_id?: string | null
          id?: string
          lead_id?: string
          max_similarity?: number
          rewrite_mode?: string
          source_hash?: string
          status?: string
          worst_chunk_pair?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "content_integrity_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "business_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      dentist_scrapes: {
        Row: {
          batch_number: number | null
          city: string
          city_id: number | null
          created_at: string | null
          email: string | null
          has_content: boolean | null
          has_email: boolean | null
          id: number
          scraped_at: string | null
          text_content: string | null
          website: string
        }
        Insert: {
          batch_number?: number | null
          city: string
          city_id?: number | null
          created_at?: string | null
          email?: string | null
          has_content?: boolean | null
          has_email?: boolean | null
          id?: number
          scraped_at?: string | null
          text_content?: string | null
          website: string
        }
        Update: {
          batch_number?: number | null
          city?: string
          city_id?: number | null
          created_at?: string | null
          email?: string | null
          has_content?: boolean | null
          has_email?: boolean | null
          id?: number
          scraped_at?: string | null
          text_content?: string | null
          website?: string
        }
        Relationships: []
      }
      dentists: {
        Row: {
          address: string | null
          city_id: string | null
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          is_approved: boolean | null
          phone: string | null
          practice_name: string
          profile_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city_id?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean | null
          phone?: string | null
          practice_name: string
          profile_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city_id?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_approved?: boolean | null
          phone?: string | null
          practice_name?: string
          profile_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dentists_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          faq: Json
          generated_at: string
          id: string
          is_active: boolean
          lead_id: string
          profile_content: string
          quotable_facts: Json
          rewrite_mode: string
          schema_json_ld: Json
          seo_description: string
          seo_title: string
        }
        Insert: {
          faq: Json
          generated_at?: string
          id?: string
          is_active?: boolean
          lead_id: string
          profile_content: string
          quotable_facts: Json
          rewrite_mode: string
          schema_json_ld: Json
          seo_description: string
          seo_title: string
        }
        Update: {
          faq?: Json
          generated_at?: string
          id?: string
          is_active?: boolean
          lead_id?: string
          profile_content?: string
          quotable_facts?: Json
          rewrite_mode?: string
          schema_json_ld?: Json
          seo_description?: string
          seo_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "business_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_extraction_jobs: {
        Row: {
          bright_data_snapshot_id: string | null
          company_segment: string
          country: string
          created_at: string
          dentist_id: string
          error_message: string | null
          id: string
          keyword: string
          location_url: string
          processed_leads: number | null
          status: string
          total_leads: number | null
          updated_at: string
        }
        Insert: {
          bright_data_snapshot_id?: string | null
          company_segment: string
          country: string
          created_at?: string
          dentist_id: string
          error_message?: string | null
          id?: string
          keyword: string
          location_url: string
          processed_leads?: number | null
          status?: string
          total_leads?: number | null
          updated_at?: string
        }
        Update: {
          bright_data_snapshot_id?: string | null
          company_segment?: string
          country?: string
          created_at?: string
          dentist_id?: string
          error_message?: string | null
          id?: string
          keyword?: string
          location_url?: string
          processed_leads?: number | null
          status?: string
          total_leads?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_extraction_jobs_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          city_id: string
          created_at: string
          current_subscribers: number | null
          dentist_id: string
          description: string | null
          duration_weeks: number
          id: string
          is_active: boolean | null
          max_subscribers: number | null
          original_price: number | null
          price: number
          terms_conditions: string | null
          title: string
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          current_subscribers?: number | null
          dentist_id: string
          description?: string | null
          duration_weeks: number
          id?: string
          is_active?: boolean | null
          max_subscribers?: number | null
          original_price?: number | null
          price: number
          terms_conditions?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          current_subscribers?: number | null
          dentist_id?: string
          description?: string | null
          duration_weeks?: number
          id?: string
          is_active?: boolean | null
          max_subscribers?: number | null
          original_price?: number | null
          price?: number
          terms_conditions?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_campaigns: {
        Row: {
          contacted: number | null
          created_at: string
          dentist_id: string
          id: string
          job_id: string
          name: string
          responded: number | null
          status: string
          total_contacts: number | null
          updated_at: string
        }
        Insert: {
          contacted?: number | null
          created_at?: string
          dentist_id: string
          id?: string
          job_id: string
          name: string
          responded?: number | null
          status?: string
          total_contacts?: number | null
          updated_at?: string
        }
        Update: {
          contacted?: number | null
          created_at?: string
          dentist_id?: string
          id?: string
          job_id?: string
          name?: string
          responded?: number | null
          status?: string
          total_contacts?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outreach_campaigns_dentist_id_fkey"
            columns: ["dentist_id"]
            isOneToOne: false
            referencedRelation: "dentists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_campaigns_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "lead_extraction_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_usage: {
        Row: {
          error_message: string | null
          id: string
          scraped_at: string
          status: string
          url: string
        }
        Insert: {
          error_message?: string | null
          id?: string
          scraped_at?: string
          status: string
          url: string
        }
        Update: {
          error_message?: string | null
          id?: string
          scraped_at?: string
          status?: string
          url?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          city_id: string | null
          email: string
          id: string
          is_active: boolean | null
          offer_id: string | null
          subscribed_at: string
        }
        Insert: {
          city_id?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          offer_id?: string | null
          subscribed_at?: string
        }
        Update: {
          city_id?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          offer_id?: string | null
          subscribed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribers_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "dentist" | "user"
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
      app_role: ["admin", "dentist", "user"],
    },
  },
} as const
