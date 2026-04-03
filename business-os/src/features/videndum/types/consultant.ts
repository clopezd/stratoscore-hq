export type MessageRole = 'user' | 'assistant'

export interface ToolCall {
  toolId: string
  toolName: string
  status: 'running' | 'done'
}

export interface ConsultantMessage {
  id: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  streaming?: boolean
  error?: boolean
  createdAt: Date
}
