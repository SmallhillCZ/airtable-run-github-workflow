import yaml from "js-yaml";
import { useEffect, useState } from "react";
import { Settings, useSettings } from "./settings";

export function fetchGithub(endpoint, init: RequestInit, settings: Settings) {
  return fetch(`https://api.github.com/repos/${settings.repository}${endpoint ? "/" + endpoint : ""}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${settings.token}`,
    },
  });
}

export function useGithub(endpoint: string | null, init?: RequestInit) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState<boolean>(null);
  const [status, setStatus] = useState<number>(null);
  const [error, setError] = useState<string>(null);

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
      settings
    ).then((res) => {
      setLoading(false);

      setStatus(res.status);

      if (!res.ok) {
        setError(res.statusText || `${res.status} Error`);
        setData(null);
      } else {
        res.json().then((data) => setData(data));
        setError(null);
      }
    });
    return () => {
      abortController.abort();
    };
  }, [endpoint, init, settings]);

  return { data, loading, error, status };
}

export function useGithubWorkflowInputs(workflow_path: string | null, ref: string | null) {
  const workflowFile = useGithub(workflow_path && ref ? `contents/${workflow_path}?ref=${ref}` : null);
  if (!workflowFile.data) return null;

  const workflowFileData = atob(workflowFile.data.content);

  const workflow = yaml.load(workflowFileData) as any;

  const inputs =
    typeof workflow?.on?.workflow_dispatch?.inputs === "object"
      ? Object.entries(workflow?.on?.workflow_dispatch?.inputs).map(([id, input]) => ({ id, ...(input as any) }))
      : [];

  return inputs;
}

export async function runWorkflow(workflow_id: string, ref: string, inputs: any, settings: Settings) {
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
    settings
  );

  if (!res.ok) {
    console.error(res.statusText);
    throw new Error(res.statusText);
  }
}
