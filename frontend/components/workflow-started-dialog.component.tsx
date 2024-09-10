import { Box, Button, Dialog, Heading } from "@airtable/blocks/ui";
import React from "react";
import { useSettings } from "../settings";

export function WorkflowStartedDialog({ onClose }: { onClose: () => void }) {
  const [settings] = useSettings();

  return (
    <Dialog onClose={() => onClose()} width="320px">
      <Dialog.CloseButton />
      <Heading>Workflow started!</Heading>
      <p>Workflow has been started successfully</p>

      <Box padding="0.5em">
        <Button
          onClick={() => {
            window.open(`https://github.com/${settings.repository}/actions`, "_blank");
            onClose();
          }}
          width="100%"
          icon="history"
        >
          View running workflows and history
        </Button>
      </Box>
    </Dialog>
  );
}
