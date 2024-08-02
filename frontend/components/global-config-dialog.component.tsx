import { Button, Dialog, FormField, Heading, Input } from "@airtable/blocks/ui";
import React, { useState } from "react";
import { useSettings } from "../settings";

export function GlobalConfigDialog({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useSettings();

  const [repository, setRepository] = useState(settings.repository);
  const [token, setToken] = useState(settings.token);

  return (
    <Dialog onClose={() => onClose()} width="320px">
      <Dialog.CloseButton />
      <Heading>Settings</Heading>

      <FormField label="Repository">
        <Input
          id="input-repository"
          value={repository}
          onChange={(e) => setRepository(e.target.value)}
          placeholder="organization/repo"
          required={true}
        />
      </FormField>

      <FormField label="Token">
        <Input
          id="input-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="patXXXXXXXXXXXXXXXXXXXXXX"
          required={true}
        />
      </FormField>

      <Button
        onClick={() => {
          setSettings({
            repository: repository,
            token: token,
          });
          onClose();
        }}
      >
        Save
      </Button>
    </Dialog>
  );
}
