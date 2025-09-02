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
      bids: {
        Row: {
          bid_amount: number
          bidder_id: string
          created_at: string
          id: string
          listing_id: string
          message: string | null
          quantity_kg: number
          status: string
          total_bid: number | null
          updated_at: string
        }
        Insert: {
          bid_amount: number
          bidder_id: string
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
          quantity_kg: number
          status?: string
          total_bid?: number | null
          updated_at?: string
        }
        Update: {
          bid_amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
          quantity_kg?: number
          status?: string
          total_bid?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_bidder_id_fkey"
            columns: ["bidder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_types: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      interests: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          message: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          message?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          message?: string | null
        }
        Relationships: []
      }
      listing_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          latitude: number | null
          listing_id: string
          longitude: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          latitude?: number | null
          listing_id: string
          longitude?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          latitude?: number | null
          listing_id?: string
          longitude?: number | null
        }
        Relationships: []
      }
      listings: {
        Row: {
          catch_date: string
          created_at: string
          description: string | null
          expires_at: string
          fish_type_id: string
          fisherman_id: string
          id: string
          image_url: string | null
          location: string
          price_per_kg: number
          status: string
          title: string
          total_price: number | null
          updated_at: string
          weight_kg: number
        }
        Insert: {
          catch_date: string
          created_at?: string
          description?: string | null
          expires_at: string
          fish_type_id: string
          fisherman_id: string
          id?: string
          image_url?: string | null
          location: string
          price_per_kg: number
          status?: string
          title: string
          total_price?: number | null
          updated_at?: string
          weight_kg: number
        }
        Update: {
          catch_date?: string
          created_at?: string
          description?: string | null
          expires_at?: string
          fish_type_id?: string
          fisherman_id?: string
          id?: string
          image_url?: string | null
          location?: string
          price_per_kg?: number
          status?: string
          title?: string
          total_price?: number | null
          updated_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_fish_type_id_fkey"
            columns: ["fish_type_id"]
            isOneToOne: false
            referencedRelation: "fish_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_fisherman_id_fkey"
            columns: ["fisherman_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_fisherman_id_fkey"
            columns: ["fisherman_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          advance_amount: number | null
          buyer_id: string
          buyer_latitude: number | null
          buyer_longitude: number | null
          chat_summary: string | null
          created_at: string
          delivery_address: string
          delivery_completed_at: string | null
          delivery_date: string | null
          delivery_otp: string | null
          delivery_status: string | null
          estimated_delivery_time: string | null
          fisherman_latitude: number | null
          fisherman_longitude: number | null
          id: string
          listing_id: string
          negotiated_price: number | null
          payment_method: string | null
          payment_screenshot_url: string | null
          payment_status: string
          payment_type: string | null
          price_per_kg: number
          quantity_kg: number
          seller_id: string
          status: string
          total_amount: number
          tracking_enabled: boolean | null
          updated_at: string
          upi_transaction_id: string | null
        }
        Insert: {
          advance_amount?: number | null
          buyer_id: string
          buyer_latitude?: number | null
          buyer_longitude?: number | null
          chat_summary?: string | null
          created_at?: string
          delivery_address: string
          delivery_completed_at?: string | null
          delivery_date?: string | null
          delivery_otp?: string | null
          delivery_status?: string | null
          estimated_delivery_time?: string | null
          fisherman_latitude?: number | null
          fisherman_longitude?: number | null
          id?: string
          listing_id: string
          negotiated_price?: number | null
          payment_method?: string | null
          payment_screenshot_url?: string | null
          payment_status?: string
          payment_type?: string | null
          price_per_kg: number
          quantity_kg: number
          seller_id: string
          status?: string
          total_amount: number
          tracking_enabled?: boolean | null
          updated_at?: string
          upi_transaction_id?: string | null
        }
        Update: {
          advance_amount?: number | null
          buyer_id?: string
          buyer_latitude?: number | null
          buyer_longitude?: number | null
          chat_summary?: string | null
          created_at?: string
          delivery_address?: string
          delivery_completed_at?: string | null
          delivery_date?: string | null
          delivery_otp?: string | null
          delivery_status?: string | null
          estimated_delivery_time?: string | null
          fisherman_latitude?: number | null
          fisherman_longitude?: number | null
          id?: string
          listing_id?: string
          negotiated_price?: number | null
          payment_method?: string | null
          payment_screenshot_url?: string | null
          payment_status?: string
          payment_type?: string | null
          price_per_kg?: number
          quantity_kg?: number
          seller_id?: string
          status?: string
          total_amount?: number
          tracking_enabled?: boolean | null
          updated_at?: string
          upi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          avg_price: number
          created_at: string
          date: string
          fish_type_id: string
          id: string
          location: string | null
          max_price: number
          min_price: number
          total_volume_kg: number
        }
        Insert: {
          avg_price: number
          created_at?: string
          date: string
          fish_type_id: string
          id?: string
          location?: string | null
          max_price: number
          min_price: number
          total_volume_kg: number
        }
        Update: {
          avg_price?: number
          created_at?: string
          date?: string
          fish_type_id?: string
          id?: string
          location?: string | null
          max_price?: number
          min_price?: number
          total_volume_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_fish_type_id_fkey"
            columns: ["fish_type_id"]
            isOneToOne: false
            referencedRelation: "fish_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"]
          state: string | null
          total_reviews: number | null
          updated_at: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          total_reviews?: number | null
          updated_at?: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          rating?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          state?: string | null
          total_reviews?: number | null
          updated_at?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          reviewed_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      marketplace_profiles: {
        Row: {
          city: string | null
          full_name: string | null
          id: string | null
          is_verified: boolean | null
          rating: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string | null
          total_reviews: number | null
        }
        Insert: {
          city?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: never
          rating?: never
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          total_reviews?: never
        }
        Update: {
          city?: string | null
          full_name?: string | null
          id?: string | null
          is_verified?: never
          rating?: never
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          total_reviews?: never
        }
        Relationships: []
      }
    }
    Functions: {
      create_notification: {
        Args: {
          notification_message: string
          notification_title: string
          notification_type?: string
          related_record_id?: string
          target_user_id: string
        }
        Returns: string
      }
      generate_delivery_otp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_safe_marketplace_profile: {
        Args: { profile_id: string }
        Returns: Json
      }
    }
    Enums: {
      user_role: "fisherman" | "supplier" | "hotel" | "market" | "admin"
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
      user_role: ["fisherman", "supplier", "hotel", "market", "admin"],
    },
  },
} as const
