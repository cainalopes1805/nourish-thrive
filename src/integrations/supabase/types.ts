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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          id: string
          modality: string
          patient_id: string
          professional_id: string
          reason_note: string | null
          service_id: string | null
          slot_id: string | null
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          modality?: string
          patient_id: string
          professional_id: string
          reason_note?: string | null
          service_id?: string | null
          slot_id?: string | null
          starts_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          modality?: string
          patient_id?: string
          professional_id?: string
          reason_note?: string | null
          service_id?: string | null
          slot_id?: string | null
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "professional_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "availability_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      article_sources: {
        Row: {
          article_id: string
          citation: string | null
          id: string
          source_id: string
        }
        Insert: {
          article_id: string
          citation?: string | null
          id?: string
          source_id: string
        }
        Update: {
          article_id?: string
          citation?: string | null
          id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_sources_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_sources_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "content_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_name: string
          author_type: string
          badge: string | null
          body: string
          category: string
          content_type: string
          cover_url: string | null
          id: string
          is_demo: boolean
          published_at: string
          reading_level: string
          reading_minutes: number
          sensitive_topics: string[]
          slug: string
          summary: string
          title: string
        }
        Insert: {
          author_name: string
          author_type?: string
          badge?: string | null
          body: string
          category: string
          content_type?: string
          cover_url?: string | null
          id?: string
          is_demo?: boolean
          published_at?: string
          reading_level?: string
          reading_minutes?: number
          sensitive_topics?: string[]
          slug: string
          summary: string
          title: string
        }
        Update: {
          author_name?: string
          author_type?: string
          badge?: string | null
          body?: string
          category?: string
          content_type?: string
          cover_url?: string | null
          id?: string
          is_demo?: boolean
          published_at?: string
          reading_level?: string
          reading_minutes?: number
          sensitive_topics?: string[]
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_booked: boolean
          professional_id: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_booked?: boolean
          professional_id: string
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_booked?: boolean
          professional_id?: string
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      care_journal_entries: {
        Row: {
          created_at: string
          difficulty: string | null
          eating_perception: string | null
          id: string
          mood: string | null
          note: string | null
          small_win: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty?: string | null
          eating_perception?: string | null
          id?: string
          mood?: string | null
          note?: string | null
          small_win?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty?: string | null
          eating_perception?: string | null
          id?: string
          mood?: string | null
          note?: string | null
          small_win?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_anonymous: boolean
          post_id: string
          status: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          post_id: string
          status?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_anonymous?: boolean
          post_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          name: string
          slug: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          name: string
          slug: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          name?: string
          slug?: string
          topic?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_records: {
        Row: {
          consent_type: string
          context: string | null
          created_at: string
          granted: boolean
          id: string
          user_id: string
        }
        Insert: {
          consent_type: string
          context?: string | null
          created_at?: string
          granted?: boolean
          id?: string
          user_id: string
        }
        Update: {
          consent_type?: string
          context?: string | null
          created_at?: string
          granted?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      consultation_notes: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          note: string
          professional_id: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          note: string
          professional_id: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          note?: string
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_notes_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_notes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sources: {
        Row: {
          created_at: string
          id: string
          name: string
          organization: string | null
          source_type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization?: string | null
          source_type?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization?: string | null
          source_type?: string
          url?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_clinical: boolean
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_clinical?: boolean
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          is_clinical?: boolean
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      feed_signals: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          signal: string
          topic: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          signal: string
          topic?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          signal?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_signals_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          moderator_id: string
          notes: string | null
          report_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          moderator_id: string
          notes?: string | null
          report_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          moderator_id?: string
          notes?: string | null
          report_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          body: string
          community_id: string | null
          created_at: string
          id: string
          image_url: string | null
          is_anonymous: boolean
          is_professional_content: boolean
          link_url: string | null
          post_type: string
          quality_score: number
          sensitive_topics: string[]
          status: string
          tags: string[]
          title: string | null
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          community_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_anonymous?: boolean
          is_professional_content?: boolean
          link_url?: string | null
          post_type?: string
          quality_score?: number
          sensitive_topics?: string[]
          status?: string
          tags?: string[]
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          community_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_anonymous?: boolean
          is_professional_content?: boolean
          link_url?: string | null
          post_type?: string
          quality_score?: number
          sensitive_topics?: string[]
          status?: string
          tags?: string[]
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          accepts_messages: boolean
          approach: string | null
          bio: string | null
          consultation_types: string[]
          council: string | null
          created_at: string
          id: string
          is_demo: boolean
          languages: string[]
          location: string | null
          name: string
          price_max: number | null
          price_min: number | null
          profession: string
          profile_photo: string | null
          rating: number | null
          registration_number: string | null
          specialties: string[]
          state: string | null
          teleconsultation_enabled: boolean
          updated_at: string
          user_id: string | null
          verified_status: string
        }
        Insert: {
          accepts_messages?: boolean
          approach?: string | null
          bio?: string | null
          consultation_types?: string[]
          council?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          languages?: string[]
          location?: string | null
          name: string
          price_max?: number | null
          price_min?: number | null
          profession: string
          profile_photo?: string | null
          rating?: number | null
          registration_number?: string | null
          specialties?: string[]
          state?: string | null
          teleconsultation_enabled?: boolean
          updated_at?: string
          user_id?: string | null
          verified_status?: string
        }
        Update: {
          accepts_messages?: boolean
          approach?: string | null
          bio?: string | null
          consultation_types?: string[]
          council?: string | null
          created_at?: string
          id?: string
          is_demo?: boolean
          languages?: string[]
          location?: string | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          profession?: string
          profile_photo?: string | null
          rating?: number | null
          registration_number?: string | null
          specialties?: string[]
          state?: string | null
          teleconsultation_enabled?: boolean
          updated_at?: string
          user_id?: string | null
          verified_status?: string
        }
        Relationships: []
      }
      professional_services: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          modality: string
          name: string
          price: number | null
          professional_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          modality?: string
          name: string
          price?: number | null
          professional_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          modality?: string
          name?: string
          price?: number | null
          professional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_services_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          feed_preferences: Json
          id: string
          interests: string[]
          onboarded: boolean
          preferred_topics: string[]
          privacy_preferences: Json
          recovery_friendly_mode: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          feed_preferences?: Json
          id: string
          interests?: string[]
          onboarded?: boolean
          preferred_topics?: string[]
          privacy_preferences?: Json
          recovery_friendly_mode?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          feed_preferences?: Json
          id?: string
          interests?: string[]
          onboarded?: boolean
          preferred_topics?: string[]
          privacy_preferences?: Json
          recovery_friendly_mode?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          id: string
          kind: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          category: string
          created_at: string
          details: string | null
          id: string
          reporter_id: string
          resolution_note: string | null
          reviewer_id: string | null
          risk_level: string
          status: string
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: string | null
          id?: string
          reporter_id: string
          resolution_note?: string | null
          reviewer_id?: string | null
          risk_level?: string
          status?: string
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string | null
          id?: string
          reporter_id?: string
          resolution_note?: string | null
          reviewer_id?: string | null
          risk_level?: string
          status?: string
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_posts: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          blocked_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          blocked_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
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
      verification_requests: {
        Row: {
          council: string
          created_at: string
          document_path: string | null
          id: string
          profession: string
          registration_number: string
          review_notes: string | null
          reviewer_id: string | null
          state: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          council: string
          created_at?: string
          document_path?: string | null
          id?: string
          profession: string
          registration_number: string
          review_notes?: string | null
          reviewer_id?: string | null
          state: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          council?: string
          created_at?: string
          document_path?: string | null
          id?: string
          profession?: string
          registration_number?: string
          review_notes?: string | null
          reviewer_id?: string | null
          state?: string
          status?: string
          updated_at?: string
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "member" | "verified_professional" | "moderator" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["member", "verified_professional", "moderator", "admin"],
    },
  },
} as const
