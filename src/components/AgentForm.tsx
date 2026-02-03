"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Agent, Execution, CreateAgentInput } from "@/types/agent";
import {
  metricsConfig,
  getDefaultMetrics,
  hasMetric,
  toggleMetric,
  toggleCategoryMetrics,
  isCategoryAllEnabled,
  isCategorySomeEnabled,
} from "@/config/metrics";
import { useAgents } from "@/context/AgentContext";

interface AgentFormProps {
  agent?: Agent;
  mode: "create" | "edit";
}

export default function AgentForm({ agent, mode }: AgentFormProps) {
  const router = useRouter();
  const { createAgent, updateAgent } = useAgents();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [status, setStatus] = useState(agent?.status ?? true);
  const [workflowId, setWorkflowId] = useState(agent?.workflow_id || "");
  const [executions, setExecutions] = useState<Execution[]>(
    agent?.executions || []
  );
  const [metrics, setMetrics] = useState<string[]>(
    agent?.metrics || getDefaultMetrics()
  );

  const [newExecutionValue, setNewExecutionValue] = useState("");
  const [newExecutionLabel, setNewExecutionLabel] = useState("");

  const handleAddExecution = () => {
    if (!newExecutionValue.trim()) return;

    const newExecution: Execution = {
      id: `exec_${Date.now()}`,
      value: newExecutionValue.trim(),
      label: newExecutionLabel.trim() || undefined,
    };

    setExecutions([...executions, newExecution]);
    setNewExecutionValue("");
    setNewExecutionLabel("");
  };

  const handleRemoveExecution = (id: string) => {
    setExecutions(executions.filter((e) => e.id !== id));
  };

  const handleMetricChange = (
    categoryKey: string,
    metricKey: string,
    checked: boolean
  ) => {
    setMetrics(toggleMetric(metrics, categoryKey, metricKey, checked));
  };

  const handleCategoryToggle = (categoryKey: string, checked: boolean) => {
    setMetrics(toggleCategoryMetrics(metrics, categoryKey, checked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data: CreateAgentInput = {
        name,
        description,
        status,
        workflow_id: workflowId,
        executions,
        metrics,
      };

      if (mode === "create") {
        const newAgent = await createAgent(data);
        console.log("agent", newAgent);
      } else if (agent) {
        await updateAgent({ agent_id: agent.agent_id, ...data });
      }

      router.push("/");
    } catch (error) {
      console.error("Failed to save agent:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Configure the basic details of your AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter agent name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this agent does"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="status">Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this agent
              </p>
            </div>
            <Switch id="status" checked={status} onCheckedChange={setStatus} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workflowId">Workflow ID</Label>
            <Input
              id="workflowId"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              placeholder="Enter n8n workflow ID"
            />
          </div>
        </CardContent>
      </Card>

      {/* Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Executions</CardTitle>
          <CardDescription>
            Add execution examples for this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {executions.length > 0 && (
            <div className="space-y-2">
              {executions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center gap-2 p-2 border rounded-md bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    {execution.label && (
                      <p className="text-sm font-medium truncate">
                        {execution.label}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {execution.value}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleRemoveExecution(execution.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="executionLabel">Label (optional)</Label>
            <Input
              id="executionLabel"
              value={newExecutionLabel}
              onChange={(e) => setNewExecutionLabel(e.target.value)}
              placeholder="e.g., Successful run example"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="executionValue">Value</Label>
            <div className="flex gap-2">
              <Input
                id="executionValue"
                value={newExecutionValue}
                onChange={(e) => setNewExecutionValue(e.target.value)}
                placeholder="Enter execution value"
              />
              <Button
                type="button"
                variant="secondary"
                className="cursor-pointer"
                onClick={handleAddExecution}
                disabled={!newExecutionValue.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Metrics</CardTitle>
          <CardDescription>
            Select which metrics to assess for this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {metricsConfig.map((category) => (
            <div key={category.key} className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`category-${category.key}`}
                  checked={isCategoryAllEnabled(metrics, category.key)}
                  ref={(el) => {
                    if (el) {
                      (
                        el as HTMLButtonElement & { indeterminate?: boolean }
                      ).indeterminate = isCategorySomeEnabled(
                        metrics,
                        category.key
                      );
                    }
                  }}
                  onCheckedChange={(checked) =>
                    handleCategoryToggle(category.key, checked === true)
                  }
                />
                <Label
                  htmlFor={`category-${category.key}`}
                  className="text-base font-semibold cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground ml-6">
                  {category.description}
                </p>
              )}
              <div className="grid gap-2 ml-6">
                {category.metrics.map((metric) => (
                  <div
                    key={`${category.key}:${metric.key}`}
                    className="flex items-start gap-2"
                  >
                    <Checkbox
                      id={`${category.key}:${metric.key}`}
                      checked={hasMetric(metrics, category.key, metric.key)}
                      onCheckedChange={(checked) =>
                        handleMetricChange(
                          category.key,
                          metric.key,
                          checked === true
                        )
                      }
                    />
                    <div className="grid gap-0.5">
                      <Label
                        htmlFor={`${category.key}:${metric.key}`}
                        className="cursor-pointer"
                      >
                        {metric.label}
                      </Label>
                      {metric.description && (
                        <p className="text-xs text-muted-foreground">
                          {metric.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={saving || !name.trim()}
        >
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create Agent"
              : "Update Agent"}
        </Button>
      </div>
    </form>
  );
}
