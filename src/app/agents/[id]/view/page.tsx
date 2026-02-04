"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Agent, ComplianceStatus } from "@/types/agent";
import { metricsConfig } from "@/config/metrics";
import Logo from "@/components/Logo";
import { RefreshCw, ArrowLeft, CheckCircle2, XCircle, MinusCircle, AlertTriangle, OctagonX } from "lucide-react";

const POLLING_INTERVAL = 30000; // 30 seconds

export default function ViewAgentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgent = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch agent");
      }
      const data = await response.json();
      setAgent(data);
    } catch (err) {
      setError("Failed to load agent data");
      console.error(err);
    }
  }, [id]);

  const fetchComplianceStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${id}/status`);
      if (!response.ok) {
        throw new Error("Failed to fetch compliance status");
      }
      const data = await response.json();
      setComplianceStatus(data);
    } catch (err) {
      console.error("Failed to fetch compliance status:", err);
    }
  }, [id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchComplianceStatus();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAgent(), fetchComplianceStatus()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAgent, fetchComplianceStatus]);

  // Polling for compliance status updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchComplianceStatus();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchComplianceStatus]);

  const getMetricStatus = (categoryKey: string, metricKey: string) => {
    const metricString = `${categoryKey}:${metricKey}`;

    // Check if the metric is in the agent's metrics array (selected for assessment)
    const isSelected = agent?.metrics.includes(metricString);

    if (!isSelected) {
      return { status: "NOT_SELECTED", label: "Not Selected", actionRequired: null };
    }

    // Check if we have a compliance status for this metric
    const status = complianceStatus.find((s) => s.metric === metricString);

    if (!status) {
      return { status: "NOT_ASSESSED", label: "Not Assessed", actionRequired: null };
    }

    // Only return action_required if it's not "NONE"
    const actionRequired = status.action_required && status.action_required !== "NONE"
      ? status.action_required
      : null;

    return { status: status.status, label: status.status, actionRequired };
  };

  const getStatusBadge = (categoryKey: string, metricKey: string) => {
    const { status, label } = getMetricStatus(categoryKey, metricKey);

    switch (status) {
      case "PASS":
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        );
      case "FAIL":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        );
      case "NOT_ASSESSED":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
            <MinusCircle className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        );
      case "NOT_SELECTED":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <MinusCircle className="w-3 h-3 mr-1" />
            {label}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionRequired = (categoryKey: string, metricKey: string) => {
    const { actionRequired } = getMetricStatus(categoryKey, metricKey);
    return actionRequired;
  };

  const getActionRequiredMessage = (action: string | null) => {
    if (!action) return null;

    switch (action) {
      case "NOTIFY":
        return {
          title: "Notify Supervisor",
          description: "This metric requires supervisor review and notification.",
          severity: "warning" as const,
        };
      case "STOP":
        return {
          title: "Stop Agent",
          description: "This metric failure requires the agent to be stopped immediately.",
          severity: "critical" as const,
        };
      default:
        return {
          title: "Action Required",
          description: action,
          severity: "warning" as const,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading agent...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "Agent not found"}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go Back
        </Button>
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
      <div className="container mx-auto py-4 sm:py-8 px-4 space-y-6">
        {/* Header with navigation */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Link href="/" className="flex-shrink-0">
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold truncate">{agent.name}</h1>
              {agent.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                  {agent.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="cursor-pointer w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
            <Link href={`/agents/${agent.agent_id}`} className="w-full sm:w-auto">
              <Button variant="outline" className="cursor-pointer w-full">
                Edit Agent
              </Button>
            </Link>
          </div>
        </div>

        {/* Agent Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Agent Details</CardTitle>
            <CardDescription>General information about this agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status badges row - always visible at top on mobile */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Status:</span>
                <Badge variant={agent.status ? "default" : "secondary"}>
                  {agent.status ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Impact:</span>
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
                    ? agent.impact_level.charAt(0).toUpperCase() + agent.impact_level.slice(1)
                    : "-"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Details grid */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Real Time Class</p>
                <p className="text-sm">{agent.real_time_class || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Action Type</p>
                <p className="text-sm">{agent.action_type || "-"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Executions</p>
                <p className="text-sm">{agent.executions.length}</p>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-3">
                <p className="text-xs font-medium text-muted-foreground">Workflow ID</p>
                <code className="text-xs sm:text-sm bg-muted px-2 py-1 rounded block truncate">
                  {agent.workflow_id || "-"}
                </code>
              </div>
            </div>

            <Separator />

            {/* Stats grid */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">LLM Calls</p>
                <p className="text-xl sm:text-2xl font-bold">{agent.llm_calls}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">API Calls</p>
                <p className="text-xl sm:text-2xl font-bold">{agent.api_calls}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">Errors Identified</p>
                <p className="text-xl sm:text-2xl font-bold">{agent.error_points_identified}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground">Errors Implemented</p>
                <p className="text-xl sm:text-2xl font-bold">{agent.error_points_implemented}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Compliance Status</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Assessment results for selected metrics (auto-refreshes every 30s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {metricsConfig.map((category) => (
              <div key={category.key} className="space-y-3">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  {category.metrics.map((metric) => {
                    const actionRequired = getActionRequired(category.key, metric.key);
                    const actionMessage = getActionRequiredMessage(actionRequired);
                    return (
                      <div
                        key={`${category.key}:${metric.key}`}
                        className="p-3 border rounded-lg bg-muted/30"
                      >
                        {/* Mobile: Stack layout, Desktop: Row layout */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-sm font-medium">{metric.label}</p>
                            {metric.description && (
                              <p className="text-xs text-muted-foreground hidden sm:block">
                                {metric.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(category.key, metric.key)}
                          </div>
                        </div>
                        {/* Action required message */}
                        {actionMessage && (
                          <div
                            className={`mt-3 p-2 rounded-md flex items-start gap-2 ${
                              actionMessage.severity === "critical"
                                ? "bg-red-50 border border-red-200"
                                : "bg-amber-50 border border-amber-200"
                            }`}
                          >
                            {actionMessage.severity === "critical" ? (
                              <OctagonX className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-medium ${
                                  actionMessage.severity === "critical"
                                    ? "text-red-800"
                                    : "text-amber-800"
                                }`}
                              >
                                {actionMessage.title}
                              </p>
                              <p
                                className={`text-xs ${
                                  actionMessage.severity === "critical"
                                    ? "text-red-700"
                                    : "text-amber-700"
                                }`}
                              >
                                {actionMessage.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
