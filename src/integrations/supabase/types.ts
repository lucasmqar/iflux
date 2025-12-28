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
      admin_alerts: {
        Row: {
          active: boolean
          created_at: string
          id: string
          message: string
          target_user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          message: string
          target_user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          message?: string
          target_user_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address_default: string | null
          cnpj: string | null
          company_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          address_default?: string | null
          cnpj?: string | null
          company_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          address_default?: string | null
          cnpj?: string | null
          company_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          valid_until: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          valid_until: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          valid_until?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          company_id: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_audit_logs: {
        Row: {
          attempted_code: string
          created_at: string
          delivery_id: string
          driver_user_id: string
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
        }
        Insert: {
          attempted_code: string
          created_at?: string
          delivery_id: string
          driver_user_id: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Update: {
          attempted_code?: string
          created_at?: string
          delivery_id?: string
          driver_user_id?: string
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_audit_logs_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "order_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_profiles: {
        Row: {
          created_at: string
          id: string
          plate: string
          user_id: string
          vehicle_model: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          plate: string
          user_id: string
          vehicle_model: string
          vehicle_type: Database["public"]["Enums"]["vehicle_type"]
        }
        Update: {
          created_at?: string
          id?: string
          plate?: string
          user_id?: string
          vehicle_model?: string
          vehicle_type?: Database["public"]["Enums"]["vehicle_type"]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          tag: Database["public"]["Enums"]["notification_tag"]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          tag: Database["public"]["Enums"]["notification_tag"]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          tag?: Database["public"]["Enums"]["notification_tag"]
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      order_deliveries: {
        Row: {
          code_hash: string | null
          code_sent_at: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_code: string | null
          dropoff_address: string
          id: string
          notes: string | null
          order_id: string
          package_type: Database["public"]["Enums"]["package_type"]
          pickup_address: string
          suggested_price: number
          validated_at: string | null
          validation_attempts: number
        }
        Insert: {
          code_hash?: string | null
          code_sent_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_code?: string | null
          dropoff_address: string
          id?: string
          notes?: string | null
          order_id: string
          package_type: Database["public"]["Enums"]["package_type"]
          pickup_address: string
          suggested_price?: number
          validated_at?: string | null
          validation_attempts?: number
        }
        Update: {
          code_hash?: string | null
          code_sent_at?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_code?: string | null
          dropoff_address?: string
          id?: string
          notes?: string | null
          order_id?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          pickup_address?: string
          suggested_price?: number
          validated_at?: string | null
          validation_attempts?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_payments: {
        Row: {
          company_user_id: string
          created_at: string | null
          driver_user_id: string
          id: string
          order_id: string
          paid_at: string | null
          payment_month: string
        }
        Insert: {
          company_user_id: string
          created_at?: string | null
          driver_user_id: string
          id?: string
          order_id: string
          paid_at?: string | null
          payment_month: string
        }
        Update: {
          company_user_id?: string
          created_at?: string | null
          driver_user_id?: string
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          cancelled_at: string | null
          company_user_id: string
          completed_at: string | null
          created_at: string
          driver_completed_at: string | null
          driver_user_id: string | null
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total_value: number
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          cancelled_at?: string | null
          company_user_id: string
          completed_at?: string | null
          created_at?: string
          driver_completed_at?: string | null
          driver_user_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_value?: number
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          cancelled_at?: string | null
          company_user_id?: string
          completed_at?: string | null
          created_at?: string
          driver_completed_at?: string | null
          driver_user_id?: string | null
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_value?: number
          updated_at?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          company_user_id: string
          created_at: string | null
          driver_user_id: string
          id: string
          marked_at: string | null
          payment_month: string
          total_orders: number
          total_value: number
        }
        Insert: {
          company_user_id: string
          created_at?: string | null
          driver_user_id: string
          id?: string
          marked_at?: string | null
          payment_month: string
          total_orders: number
          total_value: number
        }
        Update: {
          company_user_id?: string
          created_at?: string | null
          driver_user_id?: string
          id?: string
          marked_at?: string | null
          payment_month?: string
          total_orders?: number
          total_value?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          from_user_id: string
          id: string
          order_id: string
          stars: number
          to_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          from_user_id: string
          id?: string
          order_id: string
          stars: number
          to_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          from_user_id?: string
          id?: string
          order_id?: string
          stars?: number
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      check_overdue_reports: { Args: never; Returns: undefined }
      generate_delivery_code: { Args: never; Returns: string }
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
      hash_delivery_code: { Args: { code: string }; Returns: string }
      set_my_role: {
        Args: { p_role: Database["public"]["Enums"]["app_role"] }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      validate_delivery_code: {
        Args: {
          p_code: string
          p_delivery_id: string
          p_driver_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "company" | "driver"
      notification_tag: "deliveries" | "credits" | "account"
      order_status:
        | "pending"
        | "accepted"
        | "driver_completed"
        | "completed"
        | "cancelled"
      package_type: "envelope" | "bag" | "small_box" | "large_box" | "other"
      vehicle_type: "moto" | "car" | "bike"
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
      app_role: ["admin", "company", "driver"],
      notification_tag: ["deliveries", "credits", "account"],
      order_status: [
        "pending",
        "accepted",
        "driver_completed",
        "completed",
        "cancelled",
      ],
      package_type: ["envelope", "bag", "small_box", "large_box", "other"],
      vehicle_type: ["moto", "car", "bike"],
    },
  },
} as const
