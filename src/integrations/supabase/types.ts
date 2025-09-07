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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      adoption_posts: {
        Row: {
          age: string | null
          breed: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string | null
          owner_secret_hash: string
          species: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          age?: string | null
          breed?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          owner_secret_hash: string
          species?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          age?: string | null
          breed?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          owner_secret_hash?: string
          species?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      classifieds: {
        Row: {
          category: string
          condition: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string | null
          price: number | null
          status: string
          store_contact: string | null
          title: string
        }
        Insert: {
          category: string
          condition?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          price?: number | null
          status?: string
          store_contact?: string | null
          title: string
        }
        Update: {
          category?: string
          condition?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          price?: number | null
          status?: string
          store_contact?: string | null
          title?: string
        }
        Relationships: []
      }
      lost_posts: {
        Row: {
          breed: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          expires_at: string
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string
          lost_at: string | null
          owner_secret_hash: string
          species: string | null
          status: string
          title: string
        }
        Insert: {
          breed?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text: string
          lost_at?: string | null
          owner_secret_hash: string
          species?: string | null
          status?: string
          title: string
        }
        Update: {
          breed?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string
          lost_at?: string | null
          owner_secret_hash?: string
          species?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      reported_posts: {
        Row: {
          breed: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string
          seen_at: string | null
          species: string | null
          state: string
          status: string
          title: string
        }
        Insert: {
          breed?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text: string
          seen_at?: string | null
          species?: string | null
          state: string
          status?: string
          title: string
        }
        Update: {
          breed?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string
          seen_at?: string | null
          species?: string | null
          state?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      suspended_posts_log: {
        Row: {
          data: Json | null
          id: string
          original_post_id: string | null
          post_type: string
          reason: string | null
          reason_code: string | null
          suspended_at: string
          suspended_by: string | null
        }
        Insert: {
          data?: Json | null
          id?: string
          original_post_id?: string | null
          post_type: string
          reason?: string | null
          reason_code?: string | null
          suspended_at?: string
          suspended_by?: string | null
        }
        Update: {
          data?: Json | null
          id?: string
          original_post_id?: string | null
          post_type?: string
          reason?: string | null
          reason_code?: string | null
          suspended_at?: string
          suspended_by?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
