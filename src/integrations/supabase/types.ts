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
      event_configurations: {
        Row: {
          created_at: string
          event_id: string
          feature_food_planning_enabled: boolean
          feature_logistics_enabled: boolean
          feature_schedule_enabled: boolean
          feature_sponsors_enabled: boolean
          feature_tasks_enabled: boolean | null
          feature_vendors_enabled: boolean
          feature_venues_enabled: boolean
          feature_volunteers_enabled: boolean
          id: string
          invitation_image_url: string | null
          is_published: boolean
          published_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          feature_food_planning_enabled?: boolean
          feature_logistics_enabled?: boolean
          feature_schedule_enabled?: boolean
          feature_sponsors_enabled?: boolean
          feature_tasks_enabled?: boolean | null
          feature_vendors_enabled?: boolean
          feature_venues_enabled?: boolean
          feature_volunteers_enabled?: boolean
          id?: string
          invitation_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          feature_food_planning_enabled?: boolean
          feature_logistics_enabled?: boolean
          feature_schedule_enabled?: boolean
          feature_sponsors_enabled?: boolean
          feature_tasks_enabled?: boolean | null
          feature_vendors_enabled?: boolean
          feature_venues_enabled?: boolean
          feature_volunteers_enabled?: boolean
          id?: string
          invitation_image_url?: string | null
          is_published?: boolean
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_configurations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_food_items: {
        Row: {
          actual_cost: number | null
          assigned_volunteer_id: string | null
          created_at: string
          estimated_cost: number | null
          food_session_id: string
          food_type: string
          id: string
          item_name: string
          notes: string | null
          quantity: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          actual_cost?: number | null
          assigned_volunteer_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          food_session_id: string
          food_type: string
          id?: string
          item_name: string
          notes?: string | null
          quantity?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          actual_cost?: number | null
          assigned_volunteer_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          food_session_id?: string
          food_type?: string
          id?: string
          item_name?: string
          notes?: string | null
          quantity?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_food_items_assigned_volunteer_id_fkey"
            columns: ["assigned_volunteer_id"]
            isOneToOne: false
            referencedRelation: "event_volunteers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_food_items_food_session_id_fkey"
            columns: ["food_session_id"]
            isOneToOne: false
            referencedRelation: "event_food_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      event_food_session_guest_categories: {
        Row: {
          created_at: string
          food_session_id: string
          guest_category_id: string
          id: string
          is_chargeable: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          food_session_id: string
          guest_category_id: string
          id?: string
          is_chargeable?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          food_session_id?: string
          guest_category_id?: string
          id?: string
          is_chargeable?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_food_session_guest_categories_food_session_id_fkey"
            columns: ["food_session_id"]
            isOneToOne: false
            referencedRelation: "event_food_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_food_session_guest_categories_guest_category_id_fkey"
            columns: ["guest_category_id"]
            isOneToOne: false
            referencedRelation: "event_guest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_food_sessions: {
        Row: {
          allow_all_guest_categories: boolean | null
          building_id: string | null
          created_at: string
          default_charge_amount: number | null
          estimated_attendees: number | null
          event_id: string
          id: string
          location: string | null
          meal_type: string
          notes: string | null
          room_id: string | null
          session_date: string
          session_time: string | null
          updated_at: string
        }
        Insert: {
          allow_all_guest_categories?: boolean | null
          building_id?: string | null
          created_at?: string
          default_charge_amount?: number | null
          estimated_attendees?: number | null
          event_id: string
          id?: string
          location?: string | null
          meal_type: string
          notes?: string | null
          room_id?: string | null
          session_date: string
          session_time?: string | null
          updated_at?: string
        }
        Update: {
          allow_all_guest_categories?: boolean | null
          building_id?: string | null
          created_at?: string
          default_charge_amount?: number | null
          estimated_attendees?: number | null
          event_id?: string
          id?: string
          location?: string | null
          meal_type?: string
          notes?: string | null
          room_id?: string | null
          session_date?: string
          session_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_food_sessions_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "event_buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_food_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_food_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "event_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      event_guest_categories: {
        Row: {
          benefits: string | null
          category_level: number
          category_name: string
          created_at: string
          display_color: string | null
          event_id: string
          id: string
          is_system_category: boolean | null
          max_guests: number | null
          updated_at: string
        }
        Insert: {
          benefits?: string | null
          category_level?: number
          category_name: string
          created_at?: string
          display_color?: string | null
          event_id: string
          id?: string
          is_system_category?: boolean | null
          max_guests?: number | null
          updated_at?: string
        }
        Update: {
          benefits?: string | null
          category_level?: number
          category_name?: string
          created_at?: string
          display_color?: string | null
          event_id?: string
          id?: string
          is_system_category?: boolean | null
          max_guests?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_guest_categories_event_id_fkey"
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
          guest_category_id: string | null
          id: string
          internal_classification: string | null
          internal_notes: string | null
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
          guest_category_id?: string | null
          id?: string
          internal_classification?: string | null
          internal_notes?: string | null
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
          guest_category_id?: string | null
          id?: string
          internal_classification?: string | null
          internal_notes?: string | null
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
          {
            foreignKeyName: "event_guests_guest_category_id_fkey"
            columns: ["guest_category_id"]
            isOneToOne: false
            referencedRelation: "event_guest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_invitations: {
        Row: {
          created_at: string
          event_id: string
          guest_id: string
          id: string
          invitation_code: string
          opened_at: string | null
          responded_at: string | null
          response: string | null
          sent_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          guest_id: string
          id?: string
          invitation_code: string
          opened_at?: string | null
          responded_at?: string | null
          response?: string | null
          sent_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          guest_id?: string
          id?: string
          invitation_code?: string
          opened_at?: string | null
          responded_at?: string | null
          response?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_invitations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "event_guests"
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
      event_schedule_guest_categories: {
        Row: {
          created_at: string
          guest_category_id: string
          id: string
          schedule_id: string
        }
        Insert: {
          created_at?: string
          guest_category_id: string
          id?: string
          schedule_id: string
        }
        Update: {
          created_at?: string
          guest_category_id?: string
          id?: string
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_schedule_guest_categories_guest_category_id_fkey"
            columns: ["guest_category_id"]
            isOneToOne: false
            referencedRelation: "event_guest_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_schedule_guest_categories_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "event_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      event_schedules: {
        Row: {
          allow_all_guest_categories: boolean | null
          building_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          event_id: string
          id: string
          location: string | null
          metadata: Json | null
          online_link: string | null
          order_index: number
          room_id: string | null
          session_mode: string | null
          session_title: string
          session_type: string | null
          speaker: string | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          allow_all_guest_categories?: boolean | null
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          event_id: string
          id?: string
          location?: string | null
          metadata?: Json | null
          online_link?: string | null
          order_index?: number
          room_id?: string | null
          session_mode?: string | null
          session_title: string
          session_type?: string | null
          speaker?: string | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          allow_all_guest_categories?: boolean | null
          building_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_id?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          online_link?: string | null
          order_index?: number
          room_id?: string | null
          session_mode?: string | null
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
      event_task_ai_config: {
        Row: {
          ai_monitoring_enabled: boolean | null
          analysis_frequency_hours: number | null
          auto_create_tasks: boolean | null
          auto_suggest_tasks: boolean | null
          created_at: string | null
          event_id: string
          id: string
          last_analysis_at: string | null
          updated_at: string | null
        }
        Insert: {
          ai_monitoring_enabled?: boolean | null
          analysis_frequency_hours?: number | null
          auto_create_tasks?: boolean | null
          auto_suggest_tasks?: boolean | null
          created_at?: string | null
          event_id: string
          id?: string
          last_analysis_at?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_monitoring_enabled?: boolean | null
          analysis_frequency_hours?: number | null
          auto_create_tasks?: boolean | null
          auto_suggest_tasks?: boolean | null
          created_at?: string | null
          event_id?: string
          id?: string
          last_analysis_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_task_ai_config_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "event_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      event_task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          is_system_message: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "event_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      event_task_reminders: {
        Row: {
          created_at: string | null
          id: string
          remind_at: string
          reminder_type: string | null
          sent_at: string | null
          task_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          remind_at: string
          reminder_type?: string | null
          sent_at?: string | null
          task_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          remind_at?: string
          reminder_type?: string | null
          sent_at?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_task_reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "event_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tasks: {
        Row: {
          actual_hours: number | null
          ai_suggestion_reason: string | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          due_date_type: Database["public"]["Enums"]["due_date_type"]
          estimated_hours: number | null
          event_id: string
          id: string
          is_ai_suggested: boolean | null
          order_index: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          relative_days: number | null
          relative_hours: number | null
          relative_to_food_session_id: string | null
          relative_to_session_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          ai_suggestion_reason?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          due_date_type?: Database["public"]["Enums"]["due_date_type"]
          estimated_hours?: number | null
          event_id: string
          id?: string
          is_ai_suggested?: boolean | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          relative_days?: number | null
          relative_hours?: number | null
          relative_to_food_session_id?: string | null
          relative_to_session_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          ai_suggestion_reason?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          due_date_type?: Database["public"]["Enums"]["due_date_type"]
          estimated_hours?: number | null
          event_id?: string
          id?: string
          is_ai_suggested?: boolean | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          relative_days?: number | null
          relative_hours?: number | null
          relative_to_food_session_id?: string | null
          relative_to_session_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tasks_relative_to_food_session_id_fkey"
            columns: ["relative_to_food_session_id"]
            isOneToOne: false
            referencedRelation: "event_food_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tasks_relative_to_session_id_fkey"
            columns: ["relative_to_session_id"]
            isOneToOne: false
            referencedRelation: "event_schedules"
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
      event_volunteer_permissions: {
        Row: {
          can_comment: boolean | null
          can_create_tasks: boolean | null
          can_edit_own_tasks: boolean | null
          event_id: string
          granted_at: string | null
          granted_by: string
          id: string
          volunteer_id: string
        }
        Insert: {
          can_comment?: boolean | null
          can_create_tasks?: boolean | null
          can_edit_own_tasks?: boolean | null
          event_id: string
          granted_at?: string | null
          granted_by: string
          id?: string
          volunteer_id: string
        }
        Update: {
          can_comment?: boolean | null
          can_create_tasks?: boolean | null
          can_edit_own_tasks?: boolean | null
          event_id?: string
          granted_at?: string | null
          granted_by?: string
          id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_volunteer_permissions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "outreach_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_volunteer_permissions_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "event_volunteers"
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
      personal_event_configurations: {
        Row: {
          allow_guest_view: boolean | null
          created_at: string | null
          event_id: string
          feature_food_planning_enabled: boolean | null
          feature_logistics_enabled: boolean | null
          feature_marketplace_enabled: boolean | null
          feature_schedule_enabled: boolean | null
          feature_tasks_enabled: boolean | null
          feature_venues_enabled: boolean | null
          guest_viewable_sections: Json | null
          id: string
          invitation_image_url: string | null
          is_published: boolean | null
          published_at: string | null
          updated_at: string | null
        }
        Insert: {
          allow_guest_view?: boolean | null
          created_at?: string | null
          event_id: string
          feature_food_planning_enabled?: boolean | null
          feature_logistics_enabled?: boolean | null
          feature_marketplace_enabled?: boolean | null
          feature_schedule_enabled?: boolean | null
          feature_tasks_enabled?: boolean | null
          feature_venues_enabled?: boolean | null
          guest_viewable_sections?: Json | null
          id?: string
          invitation_image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_guest_view?: boolean | null
          created_at?: string | null
          event_id?: string
          feature_food_planning_enabled?: boolean | null
          feature_logistics_enabled?: boolean | null
          feature_marketplace_enabled?: boolean | null
          feature_schedule_enabled?: boolean | null
          feature_tasks_enabled?: boolean | null
          feature_venues_enabled?: boolean | null
          guest_viewable_sections?: Json | null
          id?: string
          invitation_image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_configurations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_food_items: {
        Row: {
          assigned_guest_id: string | null
          created_at: string | null
          food_session_id: string
          food_type: string
          id: string
          item_name: string
          marketplace_vendor_id: string | null
          notes: string | null
          quantity: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_guest_id?: string | null
          created_at?: string | null
          food_session_id: string
          food_type: string
          id?: string
          item_name: string
          marketplace_vendor_id?: string | null
          notes?: string | null
          quantity?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_guest_id?: string | null
          created_at?: string | null
          food_session_id?: string
          food_type?: string
          id?: string
          item_name?: string
          marketplace_vendor_id?: string | null
          notes?: string | null
          quantity?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_food_items_assigned_guest_id_fkey"
            columns: ["assigned_guest_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_food_items_food_session_id_fkey"
            columns: ["food_session_id"]
            isOneToOne: false
            referencedRelation: "personal_event_food_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_food_session_guest_categories: {
        Row: {
          created_at: string | null
          food_session_id: string
          guest_category_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          food_session_id: string
          guest_category_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          food_session_id?: string
          guest_category_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_food_session_guest_catego_guest_category_id_fkey"
            columns: ["guest_category_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guest_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_food_session_guest_categori_food_session_id_fkey"
            columns: ["food_session_id"]
            isOneToOne: false
            referencedRelation: "personal_event_food_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_food_sessions: {
        Row: {
          allow_all_guest_categories: boolean | null
          created_at: string | null
          estimated_attendees: number | null
          event_id: string
          id: string
          is_pot_luck_style: boolean | null
          meal_type: string
          notes: string | null
          session_date: string
          session_time: string | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          allow_all_guest_categories?: boolean | null
          created_at?: string | null
          estimated_attendees?: number | null
          event_id: string
          id?: string
          is_pot_luck_style?: boolean | null
          meal_type: string
          notes?: string | null
          session_date: string
          session_time?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          allow_all_guest_categories?: boolean | null
          created_at?: string | null
          estimated_attendees?: number | null
          event_id?: string
          id?: string
          is_pot_luck_style?: boolean | null
          meal_type?: string
          notes?: string | null
          session_date?: string
          session_time?: string | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_food_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_food_sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "personal_event_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_guest_access: {
        Row: {
          access_count: number | null
          created_at: string | null
          event_id: string
          guest_id: string
          id: string
          invitation_code: string
          last_accessed_at: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          created_at?: string | null
          event_id: string
          guest_id: string
          id?: string
          invitation_code: string
          last_accessed_at?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          created_at?: string | null
          event_id?: string
          guest_id?: string
          id?: string
          invitation_code?: string
          last_accessed_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_guest_access_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_guest_access_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guests"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_guest_categories: {
        Row: {
          benefits: string | null
          category_name: string
          created_at: string | null
          display_color: string | null
          event_id: string
          id: string
          max_guests: number | null
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          category_name: string
          created_at?: string | null
          display_color?: string | null
          event_id: string
          id?: string
          max_guests?: number | null
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          category_name?: string
          created_at?: string | null
          display_color?: string | null
          event_id?: string
          id?: string
          max_guests?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_guest_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_guests: {
        Row: {
          created_at: string | null
          dietary_preferences: string | null
          email: string
          event_id: string
          guest_category_id: string | null
          id: string
          internal_classification: string | null
          internal_notes: string | null
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
          guest_category_id?: string | null
          id?: string
          internal_classification?: string | null
          internal_notes?: string | null
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
          guest_category_id?: string | null
          id?: string
          internal_classification?: string | null
          internal_notes?: string | null
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
            foreignKeyName: "personal_event_guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_guests_guest_category_id_fkey"
            columns: ["guest_category_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_invitations: {
        Row: {
          created_at: string | null
          event_id: string
          guest_id: string
          id: string
          invitation_code: string
          opened_at: string | null
          responded_at: string | null
          response: string | null
          sent_at: string | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          guest_id: string
          id?: string
          invitation_code: string
          opened_at?: string | null
          responded_at?: string | null
          response?: string | null
          sent_at?: string | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          guest_id?: string
          id?: string
          invitation_code?: string
          opened_at?: string | null
          responded_at?: string | null
          response?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_invitations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guests"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_logistics: {
        Row: {
          actual_cost: number | null
          assigned_guest_id: string | null
          category: string
          created_at: string | null
          estimated_cost: number | null
          event_id: string
          id: string
          item_name: string
          marketplace_vendor_id: string | null
          notes: string | null
          quantity: number | null
          source: string | null
          status: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_guest_id?: string | null
          category: string
          created_at?: string | null
          estimated_cost?: number | null
          event_id: string
          id?: string
          item_name: string
          marketplace_vendor_id?: string | null
          notes?: string | null
          quantity?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_guest_id?: string | null
          category?: string
          created_at?: string | null
          estimated_cost?: number | null
          event_id?: string
          id?: string
          item_name?: string
          marketplace_vendor_id?: string | null
          notes?: string | null
          quantity?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_logistics_assigned_guest_id_fkey"
            columns: ["assigned_guest_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_logistics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_organizers: {
        Row: {
          accepted_at: string | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          email: string
          event_id: string
          id: string
          invited_at: string | null
          name: string
          role: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          email: string
          event_id: string
          id?: string
          invited_at?: string | null
          name: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          email?: string
          event_id?: string
          id?: string
          invited_at?: string | null
          name?: string
          role?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_organizers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_schedules: {
        Row: {
          created_at: string | null
          description: string | null
          end_time: string
          event_id: string
          id: string
          location: string | null
          notes: string | null
          order_index: number | null
          session_title: string
          start_time: string
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_time: string
          event_id: string
          id?: string
          location?: string | null
          notes?: string | null
          order_index?: number | null
          session_title: string
          start_time: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_time?: string
          event_id?: string
          id?: string
          location?: string | null
          notes?: string | null
          order_index?: number | null
          session_title?: string
          start_time?: string
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_schedules_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "personal_event_venues"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          assignee_type: string
          guest_id: string | null
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          assignee_type: string
          guest_id?: string | null
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          assignee_type?: string
          guest_id?: string | null
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_task_assignments_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "personal_event_guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "personal_event_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_task_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          is_system_message: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "personal_event_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_task_reminders: {
        Row: {
          created_at: string | null
          id: string
          remind_at: string
          reminder_type: string | null
          sent_at: string | null
          task_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          remind_at: string
          reminder_type?: string | null
          sent_at?: string | null
          task_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          remind_at?: string
          reminder_type?: string | null
          sent_at?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_task_reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "personal_event_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_tasks: {
        Row: {
          actual_hours: number | null
          ai_suggestion_reason: string | null
          category: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string
          description: string | null
          due_date: string | null
          due_date_type: Database["public"]["Enums"]["due_date_type"] | null
          estimated_hours: number | null
          event_id: string
          id: string
          is_ai_suggested: boolean | null
          order_index: number | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          relative_days: number | null
          relative_hours: number | null
          relative_to_food_session_id: string | null
          relative_to_session_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          ai_suggestion_reason?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          due_date?: string | null
          due_date_type?: Database["public"]["Enums"]["due_date_type"] | null
          estimated_hours?: number | null
          event_id: string
          id?: string
          is_ai_suggested?: boolean | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          relative_days?: number | null
          relative_hours?: number | null
          relative_to_food_session_id?: string | null
          relative_to_session_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          ai_suggestion_reason?: string | null
          category?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          due_date?: string | null
          due_date_type?: Database["public"]["Enums"]["due_date_type"] | null
          estimated_hours?: number | null
          event_id?: string
          id?: string
          is_ai_suggested?: boolean | null
          order_index?: number | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          relative_days?: number | null
          relative_hours?: number | null
          relative_to_food_session_id?: string | null
          relative_to_session_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_tasks_relative_to_food_session_id_fkey"
            columns: ["relative_to_food_session_id"]
            isOneToOne: false
            referencedRelation: "personal_event_food_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_event_tasks_relative_to_session_id_fkey"
            columns: ["relative_to_session_id"]
            isOneToOne: false
            referencedRelation: "personal_event_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_event_venues: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          event_id: string
          facilities: string | null
          id: string
          notes: string | null
          order_index: number | null
          updated_at: string | null
          venue_name: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          event_id: string
          facilities?: string | null
          id?: string
          notes?: string | null
          order_index?: number | null
          updated_at?: string | null
          venue_name: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          event_id?: string
          facilities?: string | null
          id?: string
          notes?: string | null
          order_index?: number | null
          updated_at?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_event_venues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "personal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_events: {
        Row: {
          age_restriction: string | null
          allow_accompanies: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          event_date: string
          event_end_date: string | null
          event_end_time: string | null
          event_time: string
          event_types: string[]
          goal: string | null
          id: string
          is_multi_day: boolean | null
          is_private: boolean | null
          is_unlimited_guests: boolean | null
          location: string
          max_accompanies_per_guest: number | null
          max_guests: number | null
          name: string
          purpose: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          age_restriction?: string | null
          allow_accompanies?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_date: string
          event_end_date?: string | null
          event_end_time?: string | null
          event_time: string
          event_types: string[]
          goal?: string | null
          id?: string
          is_multi_day?: boolean | null
          is_private?: boolean | null
          is_unlimited_guests?: boolean | null
          location: string
          max_accompanies_per_guest?: number | null
          max_guests?: number | null
          name: string
          purpose?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          age_restriction?: string | null
          allow_accompanies?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          event_date?: string
          event_end_date?: string | null
          event_end_time?: string | null
          event_time?: string
          event_types?: string[]
          goal?: string | null
          id?: string
          is_multi_day?: boolean | null
          is_private?: boolean | null
          is_unlimited_guests?: boolean | null
          location?: string
          max_accompanies_per_guest?: number | null
          max_guests?: number | null
          name?: string
          purpose?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_personal_task_due_date: {
        Args: {
          _task: Database["public"]["Tables"]["personal_event_tasks"]["Row"]
        }
        Returns: string
      }
      calculate_task_due_date: {
        Args: { _task: Database["public"]["Tables"]["event_tasks"]["Row"] }
        Returns: string
      }
      can_manage_event_tasks: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      can_manage_personal_event_tasks: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_event_tasks: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_personal_event_tasks: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
      has_guest_view_access: {
        Args: { p_event_id: string; p_section: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      due_date_type:
        | "fixed_datetime"
        | "relative_to_event"
        | "relative_to_session"
        | "relative_to_food_session"
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
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "blocked"
        | "cancelled"
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
      due_date_type: [
        "fixed_datetime",
        "relative_to_event",
        "relative_to_session",
        "relative_to_food_session",
      ],
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
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "not_started",
        "in_progress",
        "completed",
        "blocked",
        "cancelled",
      ],
    },
  },
} as const
