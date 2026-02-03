"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AgentForm from "@/components/AgentForm";
import { useAgents } from "@/context/AgentContext";
import Logo from "@/components/Logo";

export default function EditAgentPage() {
  const params = useParams();
  const { getAgent, loading } = useAgents();
  const id = params.id as string;
  const agent = getAgent(id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading agent...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <Logo className="cursor-pointer" />
            </Link>
          </div>
        </header>
        <div className="container mx-auto py-8 px-4 max-w-3xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The agent you are looking for does not exist.
            </p>
            <Link href="/">
              <Button className="cursor-pointer">Back to Agents</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Logo className="cursor-pointer" />
          </Link>
        </div>
      </header>
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4 cursor-pointer">
              &larr; Back to Agents
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Edit Agent</h1>
          <p className="text-muted-foreground">
            Update the configuration for {agent.name}
          </p>
        </div>

        <AgentForm mode="edit" agent={agent} />
      </div>
    </div>
  );
}
