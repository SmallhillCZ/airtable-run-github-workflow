import { Box, Button } from "@airtable/blocks/ui";
import React from "react";

export function WorkflowButton({ workflow, onClick }: { workflow: any; onClick: () => void }) {
  return (
    <Box key={workflow.id} padding="0.5em">
      <Button onClick={onClick} width="100%" variant="primary" icon="bolt">
        {workflow.name}
      </Button>
    </Box>
  );
}
