"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Agent, CreateAgentInput, UpdateAgentInput } from "@/types/agent";

interface AgentContextType {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  getAgent: (id: string) => Promise<Agent | undefined>;
  createAgent: (input: CreateAgentInput) => Promise<Agent>;
  updateAgent: (input: UpdateAgentInput) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  refreshAgents: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

function generateId(): string {
  return `agent_${Date.now()}`;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      return { Authorization: `Basic ${token}` };
    }
    return {};
  }, []);

  const fetchAgents = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/agents", {
        headers: { Authorization: `Basic ${token}` },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch agents");
      }

      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load agents on mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const refreshAgents = useCallback(async () => {
    await fetchAgents();
  }, [fetchAgents]);

  const getAgent = useCallback(async (id: string): Promise<Agent | undefined> => {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch agent");
      }

      return await response.json();
    } catch (err) {
      console.error("Failed to fetch agent:", err);
      return undefined;
    }
  }, []);

  const createAgent = useCallback(
    async (input: CreateAgentInput): Promise<Agent> => {
      const agentId = generateId();

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          agent_id: agentId,
          ...input,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create agent");
      }

      const newAgent: Agent = {
        agent_id: agentId,
        ...input,
      };

      // Refresh the agents list
      await fetchAgents();

      return newAgent;
    },
    [fetchAgents]
  );

  const updateAgent = useCallback(
    async (input: UpdateAgentInput): Promise<Agent> => {
      const response = await fetch(`/api/agents/${input.agent_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update agent");
      }

      // Refresh the agents list
      await fetchAgents();

      // Find and return the updated agent
      const updatedAgent = agents.find((a) => a.agent_id === input.agent_id);
      return updatedAgent || ({ ...input } as Agent);
    },
    [fetchAgents, agents]
  );

  const deleteAgent = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch(`/api/agents/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete agent");
      }

      // Refresh the agents list
      await fetchAgents();
    },
    [fetchAgents]
  );

  return (
    <AgentContext.Provider
      value={{
        agents,
        loading,
        error,
        getAgent,
        createAgent,
        updateAgent,
        deleteAgent,
        refreshAgents,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error("useAgents must be used within an AgentProvider");
  }
  return context;
}
