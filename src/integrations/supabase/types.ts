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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      event_guests: {
        Row: {
          created_at: string | null
          dietary_preferences: string | null
          email: string
          event_id: string
          id: string
          invitation_status: string | null
          name: string
          num_accompanies: number | null
          phone: string | null
          rsvp_date: string | null
          special_requirements: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dietary_preferences?: string | null
          email: string
          event_id: string
          id?: string
          invitation_status?: string | null
          name: string
          num_accompanies?: number | null
          phone?: string | null
          rsvp_date?: string | null
          special_requirements?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dietary_preferences?: string | null
          email?: string
          event_id?: string
          id?: string
          invitation_status?: string | null
          name?: string
          num_accompanies?: number | null
          phone?: string | null
          rsvp_date?: string | null
          special_requirements?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_logistics: {
        Row: {
          actual_cost: number | null
          category: string
          created_at: string | null
          estimated_cost: number | null
          event_id: string
          id: string
          item_name: string
          notes: string | null
          quantity: number | null
          status: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          actual_cost?: number | null
          category: string
          created_at?: string | null
          estimated_cost?: number | null
          event_id: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          actual_cost?: number | null
          category?: string
          created_at?: string | null
          estimated_cost?: number | null
          event_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: number | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_logistics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedules: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_id: string
          id: string
          location: string | null
          order_index: number
          session_title: string
          speaker: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_id: string
          id?: string
          location?: string | null
          order_index?: number
          session_title: string
          speaker?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_id?: string
          id?: string
          location?: string | null
          order_index?: number
          session_title?: string
          speaker?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_events: {
        Row: {
          allow_accompanies: boolean
          created_at: string
          description: string | null
          event_date: string
          event_time: string
          event_types: Database["public"]["Enums"]["outreach_event_type"][]
          goal: string | null
          id: string
          is_unlimited_guests: boolean
          location: string
          max_accompanies_per_guest: number | null
          max_guests: number | null
          name: string
          purpose: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_accompanies?: boolean
          created_at?: string
          description?: string | null
          event_date: string
          event_time: string
          event_types: Database["public"]["Enums"]["outreach_event_type"][]
          goal?: string | null
          id?: string
          is_unlimited_guests?: boolean
          location: string
          max_accompanies_per_guest?: number | null
          max_guests?: number | null
          name: string
          purpose?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_accompanies?: boolean
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          event_types?: Database["public"]["Enums"]["outreach_event_type"][]
          goal?: string | null
          id?: string
          is_unlimited_guests?: boolean
          location?: string
          max_accompanies_per_guest?: number | null
          max_guests?: number | null
          name?: string
          purpose?: string | null
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
      [_ in never]: never
    }
    Enums: {
      outreach_event_type:
        | "workshop"
        | "seminar"
        | "community_service"
        | "awareness_campaign"
        | "fundraiser"
        | "networking"
        | "training"
        | "volunteer"
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
      outreach_event_type: [
        "workshop",
        "seminar",
        "community_service",
        "awareness_campaign",
        "fundraiser",
        "networking",
        "training",
        "volunteer",
      ],
    },
  },
} as const
