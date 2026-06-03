import yaml from "js-yaml";
import { useEffect, useState } from "react";
import { Settings, useSettings } from "./settings";

export interface GithubRepoInfo {
  default_branch: string;
  [key: string]: any;
}

export interface GithubBranch {
  name: string;
  [key: string]: any;
}

export interface GithubWorkflow {
  id: number;
  name: string;
  path: string;
  [key: string]: any;
}

export interface GithubWorkflowsList {
  workflows: GithubWorkflow[];
  [key: string]: any;
}

export interface GithubContentFile {
  content: string;
  [key: string]: any;
}

export type WorkflowInputType = "choice" | "boolean" | "number" | "string" | "environment";

export interface WorkflowInput {
  id: string;
  description?: string;
  required?: boolean;
  default?: string;
  type?: WorkflowInputType;
  options?: string[];
}

export interface UseGithubResult<T> {
  data: T | null;
  loading: boolean | null;
  error: string | null;
  status: number | null;
}

export function fetchGithub(endpoint: string, init: RequestInit, settings: Settings) {
  return fetch(`https://api.github.com/repos/${settings.repository}${endpoint ? "/" + endpoint : ""}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${settings.token}`,
    },
  });
}

export function useGithub<T = any>(endpoint: string | null, init?: RequestInit): UseGithubResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settings] = useSettings();

  useEffect(() => {
    setData(null);
    setError(null);

    if (typeof endpoint !== "string") return;
    if (!(settings.repository && settings.token)) return;

    setLoading(true);
    const abortController = new AbortController();

    fetchGithub(
      endpoint,
      {
        signal: abortController.signal,
      },
      settings,
    ).then((res) => {
      setLoading(false);

      setStatus(res.status);

      if (!res.ok) {
        setError(res.statusText || `${res.status} Error`);
        setData(null);
      } else {
        res.json().then((data: T) => setData(data));
        setError(null);
      }
    });
    return () => {
      abortController.abort();
    };
  }, [endpoint, init, settings]);

  return { data, loading, error, status };
}

export function useGithubWorkflowInputs(workflow_path: string | null, ref: string | null): WorkflowInput[] {
  const workflowFile = useGithub<GithubContentFile>(
    workflow_path && ref ? `contents/${workflow_path}?ref=${ref}` : null,
  );
  if (!workflowFile.data) return [];

  const workflowFileData = atob(workflowFile.data.content);

  const workflow = yaml.load(workflowFileData) as any;

  const rawInputs = workflow?.on?.workflow_dispatch?.inputs;
  const inputs: WorkflowInput[] =
    rawInputs && typeof rawInputs === "object"
      ? Object.entries(rawInputs).map(([id, input]) => ({ id, ...(input as Omit<WorkflowInput, "id">) }))
      : [];

  return inputs;
}

export async function runWorkflow(
  workflow_id: number | string,
  ref: string,
  inputs: Record<string, string>,
  settings: Settings,
) {
  const body = { ref, inputs };

  const res = await fetchGithub(
    `actions/workflows/${workflow_id}/dispatches`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    },
    settings,
  );

  if (!res.ok) {
    console.error(res.statusText);
    throw new Error(res.statusText);
  }
}
