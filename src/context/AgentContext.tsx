"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Agent, CreateAgentInput, UpdateAgentInput } from "@/types/agent";

interface AgentContextType {
  agents: Agent[];
  loading: boolean;
  error: string | null;
  getAgent: (id: string) => Agent | undefined;
  createAgent: (input: CreateAgentInput) => Promise<Agent>;
  updateAgent: (input: UpdateAgentInput) => Promise<Agent>;
  deleteAgent: (id: string) => Promise<void>;
  refreshAgents: () => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

const STORAGE_KEY = "cortex-workflow-agents";

function generateId(): string {
  return `agent_${Date.now()}`;
}

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load agents from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAgents(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load agents from storage:", err);
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save agents to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
    }
  }, [agents, loading]);

  const refreshAgents = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAgents(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to refresh agents:", err);
    }
  }, []);

  const getAgent = useCallback(
    (id: string) => {
      return agents.find((agent) => agent.agent_id === id);
    },
    [agents]
  );

  const createAgent = useCallback(async (input: CreateAgentInput): Promise<Agent> => {
    const newAgent: Agent = {
      ...input,
      agent_id: generateId(),
    };

    setAgents((prev) => [...prev, newAgent]);
    return newAgent;
  }, []);

  const updateAgent = useCallback(async (input: UpdateAgentInput): Promise<Agent> => {
    return new Promise((resolve, reject) => {
      setAgents((prev) => {
        const index = prev.findIndex((agent) => agent.agent_id === input.agent_id);
        if (index === -1) {
          reject(new Error("Agent not found"));
          return prev;
        }

        const updatedAgent: Agent = {
          ...prev[index],
          ...input,
        };

        const newAgents = [...prev];
        newAgents[index] = updatedAgent;
        resolve(updatedAgent);
        return newAgents;
      });
    });
  }, []);

  const deleteAgent = useCallback(async (id: string): Promise<void> => {
    setAgents((prev) => prev.filter((agent) => agent.agent_id !== id));
  }, []);

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
