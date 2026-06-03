import { Box } from "@airtable/blocks/ui";
import React, { useState } from "react";
import { GithubWorkflow, GithubWorkflowsList, useGithub } from "../github";
import { WorkflowButton } from "./workflow-button";
import { WorkFlowDialogComponent } from "./workflow-dialog.component";
import { WorkflowStartedDialog } from "./workflow-started-dialog.component";

export function WorkflowsListComponent() {
  const workflows = useGithub<GithubWorkflowsList>(`actions/workflows`);

  const [openWorkflow, setOpenWorkflow] = useState<GithubWorkflow | null>(null);

  const [workflowStartedDialogOpen, setWorkflowStartedDialogOpen] = useState(false);

  const workflowButtons = workflows.data?.workflows.map((workflow) => {
    return <WorkflowButton key={workflow.id} workflow={workflow} onClick={() => setOpenWorkflow(workflow)} />;
  });

  return (
    <>
      <Box padding="1em">
        {workflowButtons}

        {openWorkflow && (
          <WorkFlowDialogComponent
            workflow={openWorkflow}
            onClose={(workflowStarted) => {
              if (workflowStarted) setWorkflowStartedDialogOpen(true);
              setOpenWorkflow(null);
            }}
          />
        )}

        {workflowStartedDialogOpen && <WorkflowStartedDialog onClose={() => setWorkflowStartedDialogOpen(false)} />}
      </Box>
    </>
  );
}
