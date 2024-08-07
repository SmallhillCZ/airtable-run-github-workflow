import { Box, Button, Heading, initializeBlock, useSettingsButton } from "@airtable/blocks/ui";
import React, { useEffect, useState } from "react";
import { GlobalConfigDialog } from "./components/global-config-dialog.component";
import { WorkflowsListComponent } from "./components/workflows-list.component";
import { useSettings } from "./settings";

function RunWorkflowExtension() {
  const [settings] = useSettings();

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean | null>(null);

  useSettingsButton(function () {
    setIsSettingsOpen(!isSettingsOpen);
  });

  useEffect(() => {
    setIsSettingsOpen(!(settings.repository && settings.token));
  }, [settings]);

  // YOUR CODE GOES HERE
  return (
    <>
      {isSettingsOpen && (
        <GlobalConfigDialog
          onClose={() => {
            setIsSettingsOpen(false);
          }}
        />
      )}
      <Box padding="1em" paddingBottom="0">
        <Heading>Github Workflows</Heading>
        {settings.repository && <p>Repository: {settings.repository}</p>}

        {!(settings.repository && settings.token) && (
          <p>Use the settings button in the top right of the extension to provide repository credentials.</p>
        )}
      </Box>

      <WorkflowsListComponent />

      {settings.repository && (
        <Box padding="0.5em">
          <Button
            onClick={() => window.open(`https://github.com/${settings.repository}/actions`, "_blank")}
            width="100%"
            icon="history"
          >
            View running workflows and history
          </Button>
        </Box>
      )}
    </>
  );
}

initializeBlock(() => <RunWorkflowExtension />);
