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
      activities: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          message: string
          target_id: string | null
          tenant_id: string | null
          type: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          message: string
          target_id?: string | null
          tenant_id?: string | null
          type: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          message?: string
          target_id?: string | null
          tenant_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role?: string | null
        }
        Relationships: []
      }
      allowed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          is_favorite: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_favorite?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string | null
          created_at: string
          ended_at: string | null
          error: string | null
          id: string
          prompt: string
          response: string | null
          run_id: string
          source: string
          started_at: string
          status: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string
          ended_at?: string | null
          error?: string | null
          id?: string
          prompt: string
          response?: string | null
          run_id: string
          source: string
          started_at?: string
          status?: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string
          ended_at?: string | null
          error?: string | null
          id?: string
          prompt?: string
          response?: string | null
          run_id?: string
          source?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas: {
        Row: {
          activa: boolean
          balance_inicial: number
          color: string | null
          created_at: string | null
          fecha_corte: string
          id: string
          nombre: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          activa?: boolean
          balance_inicial?: number
          color?: string | null
          created_at?: string | null
          fecha_corte?: string
          id?: string
          nombre: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          activa?: boolean
          balance_inicial?: number
          color?: string | null
          created_at?: string | null
          fecha_corte?: string
          id?: string
          nombre?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: string
          created_at: string | null
          created_by_agent_id: string | null
          id: string
          path: string | null
          task_id: string | null
          tenant_id: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          created_by_agent_id?: string | null
          id?: string
          path?: string | null
          task_id?: string | null
          tenant_id?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by_agent_id?: string | null
          id?: string
          path?: string | null
          task_id?: string | null
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_agent_id_fkey"
            columns: ["created_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      draw: {
        Row: {
          created_at: string
          is_deleted: boolean
          name: string
          page_elements: Json | null
          page_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          is_deleted?: boolean
          name?: string
          page_elements?: Json | null
          page_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          is_deleted?: boolean
          name?: string
          page_elements?: Json | null
          page_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gastos_anuales: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string | null
          cuenta: string
          dia_de_cobro: number
          id: string
          mes_de_cobro: number
          monto: number
          nombre_servicio: string
        }
        Insert: {
          activo?: boolean
          categoria: string
          created_at?: string | null
          cuenta: string
          dia_de_cobro: number
          id?: string
          mes_de_cobro: number
          monto: number
          nombre_servicio: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string | null
          cuenta?: string
          dia_de_cobro?: number
          id?: string
          mes_de_cobro?: number
          monto?: number
          nombre_servicio?: string
        }
        Relationships: []
      }
      gastos_mensuales: {
        Row: {
          activo: boolean
          categoria: string
          created_at: string | null
          cuenta: string
          dia_de_cobro: number
          id: string
          monto: number
          nombre_app: string
        }
        Insert: {
          activo?: boolean
          categoria: string
          created_at?: string | null
          cuenta: string
          dia_de_cobro: number
          id?: string
          monto: number
          nombre_app: string
        }
        Update: {
          activo?: boolean
          categoria?: string
          created_at?: string | null
          cuenta?: string
          dia_de_cobro?: number
          id?: string
          monto?: number
          nombre_app?: string
        }
        Relationships: []
      }
      global_inventory: {
        Row: {
          catalog_type: string | null
          created_at: string
          id: string
          location: string | null
          month: number | null
          organization_id: string
          part_number: string
          quantity: number
          source_sheet: string | null
          updated_at: string
          warehouse: string | null
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          location?: string | null
          month?: number | null
          organization_id?: string
          part_number: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          warehouse?: string | null
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          location?: string | null
          month?: number | null
          organization_id?: string
          part_number?: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          warehouse?: string | null
          year?: number
        }
        Relationships: []
      }
      labels: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          document_id: string
          id: string
          message_id: string
        }
        Insert: {
          document_id: string
          id?: string
          message_id: string
        }
        Update: {
          document_id?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          from_agent_id: string
          id: string
          task_id: string
          tenant_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          from_agent_id: string
          id?: string
          task_id: string
          tenant_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          from_agent_id?: string
          id?: string
          task_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_from_agent_id_fkey"
            columns: ["from_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          delivered: boolean | null
          id: string
          mentioned_agent_id: string
          tenant_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          mentioned_agent_id: string
          tenant_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          delivered?: boolean | null
          id?: string
          mentioned_agent_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_mentioned_agent_id_fkey"
            columns: ["mentioned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          catalog_type: string | null
          created_at: string
          id: string
          month: number | null
          organization_id: string
          part_number: string
          probability_pct: number | null
          quantity: number
          source_sheet: string | null
          stage: string | null
          updated_at: string
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number: string
          probability_pct?: number | null
          quantity?: number
          source_sheet?: string | null
          stage?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number?: string
          probability_pct?: number | null
          quantity?: number
          source_sheet?: string | null
          stage?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      opportunities_history: {
        Row: {
          catalog_type: string | null
          created_at: string
          id: string
          month: number | null
          opportunity_id: string | null
          organization_id: string
          part_number: string
          quantity: number
          source_sheet: string | null
          status: string | null
          updated_at: string
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          opportunity_id?: string | null
          organization_id?: string
          part_number: string
          quantity?: number
          source_sheet?: string | null
          status?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          opportunity_id?: string | null
          organization_id?: string
          part_number?: string
          quantity?: number
          source_sheet?: string | null
          status?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_history_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities_unfactored: {
        Row: {
          catalog_type: string | null
          created_at: string
          id: string
          month: number | null
          organization_id: string
          part_number: string
          quantity: number
          source_sheet: string | null
          updated_at: string
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number?: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      order_book: {
        Row: {
          catalog_type: string | null
          created_at: string
          id: string
          month: number | null
          organization_id: string
          part_number: string
          quantity: number
          source_sheet: string | null
          updated_at: string
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number?: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      order_intake: {
        Row: {
          catalog_type: string | null
          created_at: string
          id: string
          month: number | null
          organization_id: string
          part_number: string
          quantity: number
          source_sheet: string | null
          updated_at: string
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string
          id?: string
          month?: number | null
          organization_id?: string
          part_number?: string
          quantity?: number
          source_sheet?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      planning_forecasts: {
        Row: {
          created_at: string
          id: number
          month: number
          part_number: string
          quantity: number
          tenant_id: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: number
          month: number
          part_number: string
          quantity?: number
          tenant_id?: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: number
          month?: number
          part_number?: string
          quantity?: number
          tenant_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_views: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_assignees: {
        Row: {
          agent_id: string | null
          assigned_at: string | null
          id: string
          profile_id: string | null
          task_id: string
        }
        Insert: {
          agent_id?: string | null
          assigned_at?: string | null
          id?: string
          profile_id?: string | null
          task_id: string
        }
        Update: {
          agent_id?: string | null
          assigned_at?: string | null
          id?: string
          profile_id?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_labels: {
        Row: {
          id: string
          label_id: string
          task_id: string
        }
        Insert: {
          id?: string
          label_id: string
          task_id: string
        }
        Update: {
          id?: string
          label_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          border_color: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          due_date: string | null
          estimate: number | null
          id: string
          label_ids: string[] | null
          metadata: Json | null
          openclaw_run_id: string | null
          parent_task_id: string | null
          position: number
          priority: string | null
          project_id: string | null
          sequence_number: number
          session_key: string | null
          started_at: string | null
          status: string | null
          tags: string[] | null
          task_assigned_to: string | null
          tenant_id: string | null
          title: string
          used_coding_tools: boolean | null
          user_id: string | null
        }
        Insert: {
          assignee_id?: string | null
          border_color?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          due_date?: string | null
          estimate?: number | null
          id?: string
          label_ids?: string[] | null
          metadata?: Json | null
          openclaw_run_id?: string | null
          parent_task_id?: string | null
          position?: number
          priority?: string | null
          project_id?: string | null
          sequence_number?: number
          session_key?: string | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          task_assigned_to?: string | null
          tenant_id?: string | null
          title: string
          used_coding_tools?: boolean | null
          user_id?: string | null
        }
        Update: {
          assignee_id?: string | null
          border_color?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          due_date?: string | null
          estimate?: number | null
          id?: string
          label_ids?: string[] | null
          metadata?: Json | null
          openclaw_run_id?: string | null
          parent_task_id?: string | null
          position?: number
          priority?: string | null
          project_id?: string | null
          sequence_number?: number
          session_key?: string | null
          started_at?: string | null
          status?: string | null
          tags?: string[] | null
          task_assigned_to?: string | null
          tenant_id?: string | null
          title?: string
          used_coding_tools?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      transacciones: {
        Row: {
          categoria: string
          created_at: string | null
          cuenta: string
          cuenta_destino: string | null
          descripcion: string | null
          fecha_hora: string
          id: string
          monto: number
          tipo: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          cuenta: string
          cuenta_destino?: string | null
          descripcion?: string | null
          fecha_hora?: string
          id?: string
          monto: number
          tipo: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          cuenta?: string
          cuenta_destino?: string | null
          descripcion?: string | null
          fecha_hora?: string
          id?: string
          monto?: number
          tipo?: string
        }
        Relationships: []
      }
      videndum_records: {
        Row: {
          catalog_type: string | null
          created_at: string | null
          id: number
          metric_type: string
          month: number | null
          part_number: string
          quantity: number | null
          source_sheet: string | null
          tenant_id: string
          year: number
        }
        Insert: {
          catalog_type?: string | null
          created_at?: string | null
          id?: number
          metric_type: string
          month?: number | null
          part_number: string
          quantity?: number | null
          source_sheet?: string | null
          tenant_id: string
          year: number
        }
        Update: {
          catalog_type?: string | null
          created_at?: string | null
          id?: number
          metric_type?: string
          month?: number | null
          part_number?: string
          quantity?: number | null
          source_sheet?: string | null
          tenant_id?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      videndum_full_context: {
        Row: {
          avg_probability_pct: number | null
          book_to_bill: number | null
          catalog_type: string | null
          inventory_qty: number | null
          month: number | null
          opp_lost_qty: number | null
          opp_unfactored_qty: number | null
          opp_won_qty: number | null
          opportunities_qty: number | null
          order_book_qty: number | null
          order_intake_qty: number | null
          organization_id: string | null
          part_number: string | null
          pipeline_factor_pct: number | null
          revenue_qty: number | null
          warehouse: string | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_draw_from_agent: {
        Args: { p_elements: string; p_name: string; p_user_id: string }
        Returns: string
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

// ============================================================
// Domain Types (clean interfaces for app usage)
// ============================================================

export type UserRole = 'owner' | 'admin' | 'member'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  role: UserRole
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: string
  name: string
  logo_url: string | null
  created_at: string | null
}

export type AgentStatus = 'idle' | 'active' | 'blocked'
export type AgentLevel = 'LEAD' | 'INT' | 'SPC'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'archived'
export type TaskPriority = 0 | 1 | 2 | 3 | 4
export type ActivityType = 'status_update' | 'assignees_update' | 'task_update' | 'message' | 'document_created'
export type DocumentType = 'markdown' | 'code' | 'image' | 'note' | 'link' | 'spec'
export type TaskRelationType = 'blocks' | 'blocked_by' | 'related' | 'duplicate'

export interface Agent {
  id: string
  name: string
  role: string
  status: AgentStatus
  level: AgentLevel
  avatar: string
  current_task_id: string | null
  session_key: string | null
  system_prompt: string | null
  character: string | null
  lore: string | null
  user_id: string | null
  tenant_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Task {
  id: string
  sequence_number: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  tags: string[] | null
  border_color: string | null
  session_key: string | null
  openclaw_run_id: string | null
  started_at: string | null
  due_at: string | null
  estimate: number | null
  parent_task_id: string | null
  position: number
  used_coding_tools: boolean | null
  tenant_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Label {
  id: string
  name: string
  color: string
  tenant_id: string | null
  created_at: string | null
}

export interface TaskRelation {
  id: string
  source_task_id: string
  target_task_id: string
  relation_type: TaskRelationType
  created_at: string | null
}

export interface SavedView {
  id: string
  name: string
  filters: Record<string, unknown>
  sort_by: string | null
  sort_dir: string | null
  created_by_agent_id: string | null
  tenant_id: string | null
  created_at: string | null
}

export interface TaskWithAssignees extends Task {
  assignees: Profile[]
  labels?: Label[]
  subtasks?: Task[]
  messages_count?: number
  last_message_at?: string | null
}

export interface Document {
  id: string
  title: string
  content: string
  type: DocumentType
  path: string | null
  task_id: string | null
  created_by_agent_id: string | null
  tenant_id: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Message {
  id: string
  task_id: string
  from_agent_id: string
  content: string
  tenant_id: string | null
  created_at: string | null
  agent?: Agent
}

export interface Activity {
  id: string
  type: ActivityType
  agent_id: string
  message: string
  target_id: string | null
  tenant_id: string | null
  created_at: string | null
  agent?: Agent
  task?: Task | null
}

export interface Notification {
  id: string
  mentioned_agent_id: string
  content: string
  delivered: boolean | null
  tenant_id: string | null
  created_at: string | null
}

export interface ChatSession {
  id: string
  title: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
  metadata?: { source?: string; jobId?: string; jobLabel?: string } | null
}

export type ConversationStatus = 'pending' | 'done' | 'error'

export interface Conversation {
  id: string
  run_id: string
  agent_id: string | null
  prompt: string
  response: string | null
  source: string
  error: string | null
  status: ConversationStatus
  started_at: string
  ended_at: string | null
  created_at: string
  agents?: Agent
}

