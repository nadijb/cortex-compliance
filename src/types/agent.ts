export interface Execution {
  id: string;
  value: string;
  label?: string;
}

export type ImpactLevel = "low" | "medium" | "high";

export type RealTimeClass = "Real Time" | "Near Real Time" | "Not Real Time";

export type ActionType =
  | "Live Chatbot"
  | "Decision Support"
  | "Guidance / Instruction"
  | "Predictions / Scoring"
  | "Execution / Automation"
  | "Personalised Profiling";

export interface Agent {
  agent_id: string;
  name: string;
  description: string;
  status: boolean;
  workflow_id: string;
  executions: Execution[];
  metrics: string[]; // Format: "category:metric" e.g., "resilience:latency"
  impact_level: ImpactLevel;
  real_time_class: RealTimeClass;
  action_type: ActionType;
  llm_calls: number;
  api_calls: number;
  error_points_identified: number;
  error_points_implemented: number;
}

export interface CreateAgentInput {
  name: string;
  description: string;
  status: boolean;
  workflow_id: string;
  executions: Execution[];
  metrics: string[];
  impact_level: ImpactLevel;
  real_time_class: RealTimeClass;
  action_type: ActionType;
  llm_calls: number;
  api_calls: number;
  error_points_identified: number;
  error_points_implemented: number;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  agent_id: string;
}
