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
      event_buildings: {
        Row: {
          address: string | null
          building_name: string
          created_at: string
          event_id: string
          id: string
          notes: string | null
          order_index: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          building_name: string
          created_at?: string
          event_id: string
          id?: string
          notes?: string | null
          order_index?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          building_name?: string
          created_at?: string
          event_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_buildings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_business_categories: {
        Row: {
          category_name: string
          created_at: string
          description: string | null
          event_id: string
          id: string
          updated_at: string
        }
        Insert: {
          category_name: string
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          category_name?: string
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_business_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
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
      event_rooms: {
        Row: {
          building_id: string | null
          capacity: number | null
          created_at: string
          event_id: string
          facilities: string | null
          id: string
          notes: string | null
          order_index: number
          room_name: string
          updated_at: string
        }
        Insert: {
          building_id?: string | null
          capacity?: number | null
          created_at?: string
          event_id: string
          facilities?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          room_name: string
          updated_at?: string
        }
        Update: {
          building_id?: string | null
          capacity?: number | null
          created_at?: string
          event_id?: string
          facilities?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          room_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rooms_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "event_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_rooms_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedules: {
        Row: {
          building_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          event_id: string
          id: string
          location: string | null
          metadata: Json | null
          order_index: number
          room_id: string | null
          session_title: string
          session_type: string | null
          speaker: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          event_id: string
          id?: string
          location?: string | null
          metadata?: Json | null
          order_index?: number
          room_id?: string | null
          session_title: string
          session_type?: string | null
          speaker?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_id?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          order_index?: number
          room_id?: string | null
          session_title?: string
          session_type?: string | null
          speaker?: string | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_schedules_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "event_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_schedules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "event_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsor_tiers: {
        Row: {
          benefits: string | null
          contribution_amount: number | null
          created_at: string
          display_color: string | null
          event_id: string
          id: string
          tier_level: number
          tier_name: string
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          contribution_amount?: number | null
          created_at?: string
          display_color?: string | null
          event_id: string
          id?: string
          tier_level?: number
          tier_name: string
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          contribution_amount?: number | null
          created_at?: string
          display_color?: string | null
          event_id?: string
          id?: string
          tier_level?: number
          tier_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsor_tiers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          business_category_id: string | null
          contact_email: string
          contact_person: string
          contact_phone: string | null
          contribution_amount: number | null
          contribution_type: string | null
          created_at: string
          event_id: string
          id: string
          in_kind_description: string | null
          is_also_vendor: boolean | null
          logo_url: string | null
          notes: string | null
          organization_name: string
          sponsor_tier_id: string | null
          status: string | null
          updated_at: string
          vendor_id: string | null
          website: string | null
        }
        Insert: {
          business_category_id?: string | null
          contact_email: string
          contact_person: string
          contact_phone?: string | null
          contribution_amount?: number | null
          contribution_type?: string | null
          created_at?: string
          event_id: string
          id?: string
          in_kind_description?: string | null
          is_also_vendor?: boolean | null
          logo_url?: string | null
          notes?: string | null
          organization_name: string
          sponsor_tier_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
          website?: string | null
        }
        Update: {
          business_category_id?: string | null
          contact_email?: string
          contact_person?: string
          contact_phone?: string | null
          contribution_amount?: number | null
          contribution_type?: string | null
          created_at?: string
          event_id?: string
          id?: string
          in_kind_description?: string | null
          is_also_vendor?: boolean | null
          logo_url?: string | null
          notes?: string | null
          organization_name?: string
          sponsor_tier_id?: string | null
          status?: string | null
          updated_at?: string
          vendor_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_business_category_id_fkey"
            columns: ["business_category_id"]
            isOneToOne: false
            referencedRelation: "event_business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sponsors_sponsor_tier_id_fkey"
            columns: ["sponsor_tier_id"]
            isOneToOne: false
            referencedRelation: "event_sponsor_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sponsor_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "event_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      event_vendors: {
        Row: {
          booth_number: string | null
          business_category_id: string | null
          contact_email: string
          contact_person: string
          contact_phone: string | null
          contract_amount: number | null
          created_at: string
          event_id: string
          id: string
          linked_sponsor_id: string | null
          notes: string | null
          organization_name: string
          payment_status: string | null
          services_provided: string
          setup_requirements: string | null
          status: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          booth_number?: string | null
          business_category_id?: string | null
          contact_email: string
          contact_person: string
          contact_phone?: string | null
          contract_amount?: number | null
          created_at?: string
          event_id: string
          id?: string
          linked_sponsor_id?: string | null
          notes?: string | null
          organization_name: string
          payment_status?: string | null
          services_provided: string
          setup_requirements?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          booth_number?: string | null
          business_category_id?: string | null
          contact_email?: string
          contact_person?: string
          contact_phone?: string | null
          contract_amount?: number | null
          created_at?: string
          event_id?: string
          id?: string
          linked_sponsor_id?: string | null
          notes?: string | null
          organization_name?: string
          payment_status?: string | null
          services_provided?: string
          setup_requirements?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_vendors_business_category_id_fkey"
            columns: ["business_category_id"]
            isOneToOne: false
            referencedRelation: "event_business_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_vendors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_vendors_linked_sponsor_id_fkey"
            columns: ["linked_sponsor_id"]
            isOneToOne: false
            referencedRelation: "event_sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      event_volunteers: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          role: string | null
          shift_time: string | null
          skills: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          shift_time?: string | null
          skills?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          role?: string | null
          shift_time?: string | null
          skills?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_volunteers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_events: {
        Row: {
          age_restriction: string | null
          allow_accompanies: boolean
          created_at: string
          description: string | null
          duration_minutes: number | null
          event_date: string
          event_end_date: string | null
          event_end_time: string | null
          event_time: string
          event_types: Database["public"]["Enums"]["outreach_event_type"][]
          goal: string | null
          id: string
          is_multi_day: boolean | null
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
          age_restriction?: string | null
          allow_accompanies?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          event_date: string
          event_end_date?: string | null
          event_end_time?: string | null
          event_time: string
          event_types: Database["public"]["Enums"]["outreach_event_type"][]
          goal?: string | null
          id?: string
          is_multi_day?: boolean | null
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
          age_restriction?: string | null
          allow_accompanies?: boolean
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          event_date?: string
          event_end_date?: string | null
          event_end_time?: string | null
          event_time?: string
          event_types?: Database["public"]["Enums"]["outreach_event_type"][]
          goal?: string | null
          id?: string
          is_multi_day?: boolean | null
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
        | "conference"
        | "webinar"
        | "hackathon"
        | "meetup"
        | "exhibition"
        | "panel_discussion"
        | "town_hall"
        | "open_house"
        | "career_fair"
        | "health_screening"
        | "blood_donation"
        | "food_drive"
        | "mentorship_program"
        | "educational_tour"
        | "sports_event"
        | "cultural_event"
        | "charity_auction"
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
        "conference",
        "webinar",
        "hackathon",
        "meetup",
        "exhibition",
        "panel_discussion",
        "town_hall",
        "open_house",
        "career_fair",
        "health_screening",
        "blood_donation",
        "food_drive",
        "mentorship_program",
        "educational_tour",
        "sports_event",
        "cultural_event",
        "charity_auction",
      ],
    },
  },
} as const
