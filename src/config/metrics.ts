export interface MetricDefinition {
  key: string; // e.g., "error_fallbacks"
  label: string;
  description?: string;
}

export interface MetricCategory {
  key: string; // e.g., "resilience"
  name: string;
  description?: string;
  metrics: MetricDefinition[];
}

export const metricsConfig: MetricCategory[] = [
  {
    key: "resilience",
    name: "Resilience",
    description: "Measures the agent's ability to handle errors and maintain performance",
    metrics: [
      { key: "error_fallbacks", label: "Error Fallbacks", description: "Ability to handle and recover from errors" },
      { key: "latency", label: "Latency", description: "Response time performance" },
      { key: "failure_rate", label: "Failure Rate", description: "Frequency of task failures" },
      { key: "availability", label: "Availability", description: "System uptime and accessibility" },
    ],
  },
  {
    key: "hallucination_control",
    name: "Hallucination Control",
    description: "Measures the agent's accuracy and truthfulness",
    metrics: [
      { key: "hallucination_of_expected_outcomes", label: "Hallucination of Expected Outcomes", description: "Accuracy of predicted outcomes" },
      { key: "factual_hallucination", label: "Factual Hallucination", description: "Accuracy of factual information" },
      { key: "context_switch_hallucination", label: "Context Switch Hallucination", description: "Consistency during context changes" },
      { key: "severity_of_hallucination", label: "Severity of Hallucination", description: "Impact level of inaccuracies" },
    ],
  },
  {
    key: "transparency",
    name: "Transparency",
    description: "Measures the agent's openness and explainability",
    metrics: [
      { key: "operational_transparency", label: "Operational Transparency", description: "Visibility into agent operations" },
      { key: "bias", label: "Bias", description: "Fairness and neutrality in outputs" },
      { key: "version_control", label: "Version Control", description: "Tracking of model and system versions" },
      { key: "interpretability", label: "Interpretability (Model Transparency)", description: "Ability to explain decisions" },
      { key: "traceability", label: "Traceability", description: "Ability to trace actions and decisions" },
    ],
  },
  {
    key: "accountability",
    name: "Accountability",
    description: "Measures the agent's adherence to guidelines and responsibility",
    metrics: [
      { key: "guideline_adherence", label: "Guideline Adherence", description: "Compliance with established guidelines" },
      { key: "hitl_coverage", label: "HITL Coverage", description: "Human-in-the-loop oversight" },
      { key: "privacy", label: "Privacy", description: "Protection of sensitive information" },
    ],
  },
];

// Get all metrics as "category:metric" strings
export const getAllMetricKeys = (): string[] => {
  const keys: string[] = [];
  metricsConfig.forEach((category) => {
    category.metrics.forEach((metric) => {
      keys.push(`${category.key}:${metric.key}`);
    });
  });
  return keys;
};

// Get default metrics (all enabled)
export const getDefaultMetrics = (): string[] => {
  return getAllMetricKeys();
};

// Check if a metric is in the list
export const hasMetric = (metrics: string[], categoryKey: string, metricKey: string): boolean => {
  return metrics.includes(`${categoryKey}:${metricKey}`);
};

// Toggle a metric in the list
export const toggleMetric = (metrics: string[], categoryKey: string, metricKey: string, enabled: boolean): string[] => {
  const metricString = `${categoryKey}:${metricKey}`;
  if (enabled) {
    return metrics.includes(metricString) ? metrics : [...metrics, metricString];
  } else {
    return metrics.filter((m) => m !== metricString);
  }
};

// Toggle all metrics in a category
export const toggleCategoryMetrics = (metrics: string[], categoryKey: string, enabled: boolean): string[] => {
  const category = metricsConfig.find((c) => c.key === categoryKey);
  if (!category) return metrics;

  let newMetrics = [...metrics];
  category.metrics.forEach((metric) => {
    const metricString = `${categoryKey}:${metric.key}`;
    if (enabled) {
      if (!newMetrics.includes(metricString)) {
        newMetrics.push(metricString);
      }
    } else {
      newMetrics = newMetrics.filter((m) => m !== metricString);
    }
  });
  return newMetrics;
};

// Check if all metrics in a category are enabled
export const isCategoryAllEnabled = (metrics: string[], categoryKey: string): boolean => {
  const category = metricsConfig.find((c) => c.key === categoryKey);
  if (!category) return false;
  return category.metrics.every((metric) => metrics.includes(`${categoryKey}:${metric.key}`));
};

// Check if some (but not all) metrics in a category are enabled
export const isCategorySomeEnabled = (metrics: string[], categoryKey: string): boolean => {
  const category = metricsConfig.find((c) => c.key === categoryKey);
  if (!category) return false;
  const enabledCount = category.metrics.filter((metric) =>
    metrics.includes(`${categoryKey}:${metric.key}`)
  ).length;
  return enabledCount > 0 && enabledCount < category.metrics.length;
};
