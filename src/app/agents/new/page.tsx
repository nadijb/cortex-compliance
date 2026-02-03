"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import AgentForm from "@/components/AgentForm";
import Logo from "@/components/Logo";

export default function NewAgentPage() {
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
          <h1 className="text-2xl font-bold">Create New Agent</h1>
          <p className="text-muted-foreground">
            Configure a new AI agent with compliance metrics
          </p>
        </div>

        <AgentForm mode="create" />
      </div>
    </div>
  );
}
