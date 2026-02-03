"use client";

import Link from "next/link";
import { useAgents } from "@/context/AgentContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getAllMetricKeys } from "@/config/metrics";
import Logo from "@/components/Logo";
import { Agent } from "@/types/agent";

export default function HomePage() {
  const { agents, loading, deleteAgent } = useAgents();

  const getEnabledMetricsCount = (metrics: string[]) => {
    const total = getAllMetricKeys().length;
    const enabled = metrics.length;
    return { enabled, total };
  };

  const handleDelete = async (id: string) => {
    await deleteAgent(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>
      <div className="container mx-auto py-4 sm:py-8 px-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">AI Agents</CardTitle>
              <CardDescription>
                Manage your AI agents and their compliance metrics
              </CardDescription>
            </div>
            <Link href="/agents/new" className="w-full sm:w-auto">
              <Button className="cursor-pointer w-full sm:w-auto">
                Create Agent
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {agents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No agents created yet
                </p>
                <Link href="/agents/new">
                  <Button variant="outline" className="cursor-pointer">
                    Create your first agent
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile view - Card layout */}
                <div className="block md:hidden space-y-4">
                  {agents.map((agent) => (
                    <MobileAgentCard
                      key={agent.agent_id}
                      agent={agent}
                      metricsCount={getEnabledMetricsCount(agent.metrics)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>

                {/* Desktop view - Table layout */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Workflow ID
                        </TableHead>
                        <TableHead>Metrics</TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Executions
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agents.map((agent) => {
                        const metricsCount = getEnabledMetricsCount(
                          agent.metrics
                        );
                        return (
                          <TableRow key={agent.agent_id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {agent.description}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={agent.status ? "default" : "secondary"}
                              >
                                {agent.status ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  agent.impact_level === "high"
                                    ? "destructive"
                                    : agent.impact_level === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {agent.impact_level
                                  ? agent.impact_level.charAt(0).toUpperCase() +
                                    agent.impact_level.slice(1)
                                  : "-"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {agent.workflow_id || "-"}
                              </code>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {metricsCount.enabled}/{metricsCount.total}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="text-sm">
                                {agent.executions.length}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link href={`/agents/${agent.agent_id}`}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                  >
                                    Edit
                                  </Button>
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="cursor-pointer"
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Agent
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete &quot;
                                        {agent.name}&quot;? This action cannot
                                        be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="cursor-pointer">
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleDelete(agent.agent_id)
                                        }
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MobileAgentCard({
  agent,
  metricsCount,
  onDelete,
}: {
  agent: Agent;
  metricsCount: { enabled: number; total: number };
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate">{agent.name}</p>
          {agent.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {agent.description}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 items-end">
          <Badge variant={agent.status ? "default" : "secondary"}>
            {agent.status ? "Active" : "Inactive"}
          </Badge>
          <Badge
            variant={
              agent.impact_level === "high"
                ? "destructive"
                : agent.impact_level === "medium"
                  ? "default"
                  : "secondary"
            }
          >
            {agent.impact_level
              ? agent.impact_level.charAt(0).toUpperCase() +
                agent.impact_level.slice(1)
              : "-"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          Metrics: {metricsCount.enabled}/{metricsCount.total}
        </span>
        <span>Executions: {agent.executions.length}</span>
        {agent.workflow_id && (
          <span className="truncate">Workflow: {agent.workflow_id}</span>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Link href={`/agents/${agent.agent_id}`} className="flex-1">
          <Button variant="outline" size="sm" className="cursor-pointer w-full">
            Edit
          </Button>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer flex-1"
            >
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Agent</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{agent.name}&quot;? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer"
                onClick={() => onDelete(agent.agent_id)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
