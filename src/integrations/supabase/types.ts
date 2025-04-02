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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          role?: string
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
        }
        Insert: {
          admin_owner_id: string
          description: string
          id?: string
          name: string
        }
        Update: {
          admin_owner_id?: string
          description?: string
          id?: string
          name?: string
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
      generate_daily_ranking:
        | {
            Args: {
              category_id: string
            }
            Returns: string
          }
        | {
            Args: {
              category_id: string
              site_count?: number
              min_votes?: number
              max_votes?: number
            }
            Returns: string
          }
      generate_sharing_token: {
        Args: {
          ranking_id: string
          user_id: string
        }
        Returns: string
      }
      increment_site_votes: {
        Args: {
          p_ranking_id: string
          p_site_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
