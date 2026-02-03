export interface ExecutionLink {
  id: string;
  url: string;
  label?: string;
}

export interface Agent {
  agent_id: string;
  name: string;
  description: string;
  status: boolean;
  workflow_id: string;
  executions: ExecutionLink[];
  metrics: string[]; // Format: "category:metric" e.g., "resilience:latency"
}

export interface CreateAgentInput {
  name: string;
  description: string;
  status: boolean;
  workflow_id: string;
  executions: ExecutionLink[];
  metrics: string[];
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  agent_id: string;
}
