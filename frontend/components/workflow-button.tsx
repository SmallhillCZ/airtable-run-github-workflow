import { Box, Button } from "@airtable/blocks/ui";
import React from "react";
import { GithubWorkflow } from "../github";

export function WorkflowButton({ workflow, onClick }: { workflow: GithubWorkflow; onClick: () => void }) {
  return (
    <Box key={workflow.id} padding="0.5em">
      <Button onClick={onClick} width="100%" variant="primary" icon="bolt">
        {workflow.name}
      </Button>
    </Box>
  );
}
