export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      betting_sites: {
        Row: {
          admin_owner_id: string
          category: string[]
          commission: number | null
          description: string
          id: string
          logo_url: string | null
          ltv: number | null
          name: string
          registration_date: string
          site_labels: string[] | null
          url: string
        }
        Insert: {
          admin_owner_id: string
          category: string[]
          commission?: number | null
          description: string
          id?: string
          logo_url?: string | null
          ltv?: number | null
          name: string
          registration_date?: string
          site_labels?: string[] | null
          url: string
        }
        Update: {
          admin_owner_id?: string
          category?: string[]
          commission?: number | null
          description?: string
          id?: string
          logo_url?: string | null
          ltv?: number | null
          name?: string
          registration_date?: string
          site_labels?: string[] | null
          url?: string
        }
        Relationships: []
      }
      daily_rankings: {
        Row: {
          category_id: string
          category_name: string
          config_id: string | null
          expiration: string
          generation_date: string
          id: string
        }
        Insert: {
          category_id: string
          category_name: string
          config_id?: string | null
          expiration: string
          generation_date?: string
          id?: string
        }
        Update: {
          category_id?: string
          category_name?: string
          config_id?: string | null
          expiration?: string
          generation_date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_rankings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ranking_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_rankings_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "ranking_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      online_users: {
        Row: {
          current_count: number
          id: string
          max_count: number
          min_count: number
          update_interval: number
          updated_at: string | null
        }
        Insert: {
          current_count?: number
          id?: string
          max_count?: number
          min_count?: number
          update_interval?: number
          updated_at?: string | null
        }
        Update: {
          current_count?: number
          id?: string
          max_count?: number
          min_count?: number
          update_interval?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      online_users_log: {
        Row: {
          created_at: string | null
          id: number
          new_count: number | null
          old_count: number | null
          update_interval: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          new_count?: number | null
          old_count?: number | null
          update_interval?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          new_count?: number | null
          old_count?: number | null
          update_interval?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string
          username?: string | null
        }
        Relationships: []
      }
      ranked_sites: {
        Row: {
          id: string
          position: number
          ranking_id: string
          site_id: string
          votes: number
        }
        Insert: {
          id?: string
          position: number
          ranking_id: string
          site_id: string
          votes?: number
        }
        Update: {
          id?: string
          position?: number
          ranking_id?: string
          site_id?: string
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranked_sites_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "daily_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranked_sites_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_categories: {
        Row: {
          admin_owner_id: string
          description: string
          id: string
          name: string
          position: number | null
        }
        Insert: {
          admin_owner_id: string
          description: string
          id?: string
          name: string
          position?: number | null
        }
        Update: {
          admin_owner_id?: string
          description?: string
          id?: string
          name?: string
          position?: number | null
        }
        Relationships: []
      }
      ranking_configs: {
        Row: {
          category_id: string
          id: string
          last_modified: string
          max_votes: number
          min_votes: number
          site_count: number
        }
        Insert: {
          category_id: string
          id?: string
          last_modified?: string
          max_votes?: number
          min_votes?: number
          site_count?: number
        }
        Update: {
          category_id?: string
          id?: string
          last_modified?: string
          max_votes?: number
          min_votes?: number
          site_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ranking_configs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ranking_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_rankings: {
        Row: {
          expiration_date: string
          id: string
          ranking_id: string
          share_date: string
          source_user_id: string | null
          target_user_id: string | null
          unique_token: string
        }
        Insert: {
          expiration_date: string
          id?: string
          ranking_id: string
          share_date?: string
          source_user_id?: string | null
          target_user_id?: string | null
          unique_token: string
        }
        Update: {
          expiration_date?: string
          id?: string
          ranking_id?: string
          share_date?: string
          source_user_id?: string | null
          target_user_id?: string | null
          unique_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_rankings_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "daily_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      site_labels: {
        Row: {
          admin_owner_id: string
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_owner_id: string
          color: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_owner_id?: string
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_suggestions: {
        Row: {
          created_at: string
          id: string
          ip: string
          status: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip: string
          status?: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string
          status?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          id: string
          ip: string
          ranking_id: string
          site_id: string
          user_id: string | null
          vote_date: string
        }
        Insert: {
          id?: string
          ip: string
          ranking_id: string
          site_id: string
          user_id?: string | null
          vote_date?: string
        }
        Update: {
          id?: string
          ip?: string
          ranking_id?: string
          site_id?: string
          user_id?: string | null
          vote_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "daily_rankings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "betting_sites"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_suggestion_rate_limit: {
        Args: { ip_address: string }
        Returns: boolean
      }
      check_update_intervals: {
        Args: Record<PropertyKey, never>
        Returns: {
          log_time: string
          old_value: number
          new_value: number
          configured_interval_ms: number
          actual_interval_ms: number
          is_delayed: boolean
        }[]
      }
      delete_rankings_by_category: {
        Args: { p_category_id: string }
        Returns: undefined
      }
      generate_daily_ranking: {
        Args:
          | { category_id: string }
          | {
              category_id: string
              site_count?: number
              min_votes?: number
              max_votes?: number
            }
        Returns: string
      }
      generate_organic_value: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_sharing_token: {
        Args: { ranking_id: string; user_id: string }
        Returns: string
      }
      increment_site_votes: {
        Args: { p_ranking_id: string; p_site_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      random_between: {
        Args: { min_val: number; max_val: number }
        Returns: number
      }
      should_update_online_users: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      submit_site_suggestion: {
        Args: { url_input: string; ip_address: string }
        Returns: Json
      }
      test_online_users_log: {
        Args: Record<PropertyKey, never>
        Returns: {
          update_number: number
          old_value: number
          new_value: number
          interval_ms: number
          time_of_update: string
          elapsed_ms: number
        }[]
      }
      update_online_users_count: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
