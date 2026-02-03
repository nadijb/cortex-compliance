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
import {
  Agent,
  Execution,
  CreateAgentInput,
  ImpactLevel,
  RealTimeClass,
  ActionType,
} from "@/types/agent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [impactLevel, setImpactLevel] = useState<ImpactLevel>(
    agent?.impact_level || "low"
  );
  const [realTimeClass, setRealTimeClass] = useState<RealTimeClass>(
    agent?.real_time_class || "Not Real Time"
  );
  const [actionType, setActionType] = useState<ActionType>(
    agent?.action_type || "Decision Support"
  );
  const [llmCalls, setLlmCalls] = useState(agent?.llm_calls || 0);
  const [apiCalls, setApiCalls] = useState(agent?.api_calls || 0);
  const [errorPointsIdentified, setErrorPointsIdentified] = useState(
    agent?.error_points_identified || 0
  );
  const [errorPointsImplemented, setErrorPointsImplemented] = useState(
    agent?.error_points_implemented || 0
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
        impact_level: impactLevel,
        real_time_class: realTimeClass,
        action_type: actionType,
        llm_calls: llmCalls,
        api_calls: apiCalls,
        error_points_identified: errorPointsIdentified,
        error_points_implemented: errorPointsImplemented,
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

      {/* Agent Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration</CardTitle>
          <CardDescription>
            Configure the operational parameters of your AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="impactLevel">Impact Level</Label>
              <Select
                value={impactLevel}
                onValueChange={(value) => setImpactLevel(value as ImpactLevel)}
              >
                <SelectTrigger id="impactLevel">
                  <SelectValue placeholder="Select impact level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="realTimeClass">Real Time Class</Label>
              <Select
                value={realTimeClass}
                onValueChange={(value) =>
                  setRealTimeClass(value as RealTimeClass)
                }
              >
                <SelectTrigger id="realTimeClass">
                  <SelectValue placeholder="Select real time class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Real Time">Real Time</SelectItem>
                  <SelectItem value="Near Real Time">Near Real Time</SelectItem>
                  <SelectItem value="Not Real Time">Not Real Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionType">Action Type</Label>
              <Select
                value={actionType}
                onValueChange={(value) => setActionType(value as ActionType)}
              >
                <SelectTrigger id="actionType">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Live Chatbot">Live Chatbot</SelectItem>
                  <SelectItem value="Decision Support">
                    Decision Support
                  </SelectItem>
                  <SelectItem value="Guidance / Instruction">
                    Guidance / Instruction
                  </SelectItem>
                  <SelectItem value="Predictions / Scoring">
                    Predictions / Scoring
                  </SelectItem>
                  <SelectItem value="Execution / Automation">
                    Execution / Automation
                  </SelectItem>
                  <SelectItem value="Personalised Profiling">
                    Personalised Profiling
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="llmCalls">LLM Calls</Label>
              <Input
                id="llmCalls"
                type="number"
                min="0"
                value={llmCalls}
                onChange={(e) => setLlmCalls(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiCalls">API Calls</Label>
              <Input
                id="apiCalls"
                type="number"
                min="0"
                value={apiCalls}
                onChange={(e) => setApiCalls(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorPointsIdentified">
                Error Points Identified
              </Label>
              <Input
                id="errorPointsIdentified"
                type="number"
                min="0"
                value={errorPointsIdentified}
                onChange={(e) =>
                  setErrorPointsIdentified(parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="errorPointsImplemented">
                Error Points Implemented
              </Label>
              <Input
                id="errorPointsImplemented"
                type="number"
                min="0"
                value={errorPointsImplemented}
                onChange={(e) =>
                  setErrorPointsImplemented(parseInt(e.target.value) || 0)
                }
                placeholder="0"
              />
            </div>
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
