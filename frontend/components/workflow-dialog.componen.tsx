import { Box, Button, Dialog, FormField, Heading, Input, Select } from "@airtable/blocks/ui";
import React, { useEffect, useState } from "react";
import { runWorkflow, useGithub, useGithubWorkflowInputs } from "../github";
import { useSettings } from "../settings";

export function WorkFlowDialogComponent({ onClose, workflow }: { onClose: () => void; workflow: any | null }) {
  const workflowInputs = useGithubWorkflowInputs(workflow?.path);
  const repoInfo = useGithub(``);
  const branches = useGithub(`branches`);

  const [settings] = useSettings();

  const [ref, setRef] = useState(repoInfo.data?.default_branch);
  const [inputsData, setInputsData] = useState({});

  useEffect(() => {
    if (!ref) setRef(repoInfo.data?.default_branch);
  }, [ref, repoInfo]);

  const branchOptions = branches.data?.map((branch) => ({ label: branch.name, value: branch.name }));

  const inputs = workflowInputs?.map((input) => {
    return (
      <FormField key={input.id} label={input.description ?? input.id}>
        <Input
          value={inputsData[input.id] ?? input.default ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            setInputsData((prev) => {
              return { ...prev, [input.id]: value };
            });
          }}
        />
      </FormField>
    );
  });

  return (
    <Dialog onClose={() => onClose()}>
      <Dialog.CloseButton />
      <Heading>{workflow?.name}</Heading>

      <FormField label="Branch">
        {branches.loading || repoInfo.loading ? (
          "Loading..."
        ) : (
          <Select
            options={branchOptions}
            value={repoInfo.data?.default_branch}
            onChange={(newValue) => setRef(newValue)}
            width="100%"
          />
        )}
      </FormField>

      {inputs}
      <Box paddingTop="1em">
        <Button
          disabled={branches.loading || repoInfo.loading}
          onClick={() => {
            runWorkflow(workflow.id, ref, inputsData, settings).then(() => onClose());
          }}
        >
          Run workflow
        </Button>
      </Box>
    </Dialog>
  );
}
