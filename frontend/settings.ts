import { useGlobalConfig } from "@airtable/blocks/ui";
import { useState } from "react";

export interface Settings {
  repository: string;
  token: string;
}

export function useSettings() {
  const globalConfig = useGlobalConfig();

  const [settings, setSettings] = useState<Settings>({
    repository: (globalConfig.get("repository") as string) || null,
    token: (globalConfig.get("token") as string) || null,
  });

  globalConfig.watch(["repository", "token"], () => {
    setSettings({
      repository: globalConfig.get("repository") as string,
      token: globalConfig.get("token") as string,
    });
  });

  function saveSettings(settings: Settings) {
    const setPathsCheckResult = globalConfig.checkPermissionsForSetPaths([
      { path: ["repository"], value: settings.repository },
      { path: ["token"], value: settings.token },
    ]);

    if (setPathsCheckResult.hasPermission === false) {
      alert(setPathsCheckResult.reasonDisplayString);
    }

    globalConfig.setAsync("repository", settings.repository);
    globalConfig.setAsync("token", settings.token);
  }

  return [settings, saveSettings] as const;
}
