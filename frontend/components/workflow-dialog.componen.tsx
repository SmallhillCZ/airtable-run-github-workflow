import { Box, Button, Dialog, FormField, Heading, Input, Select } from "@airtable/blocks/ui";
import React, { useEffect, useState } from "react";
import { runWorkflow, useGithub, useGithubWorkflowInputs } from "../github";
import { useSettings } from "../settings";

export function WorkFlowDialogComponent({
  onClose,
  workflow,
}: {
  onClose: (workflowStarted?: boolean) => void;
  workflow: any | null;
}) {
  const repoInfo = useGithub(``);
  const branches = useGithub(`branches`);

  const [settings] = useSettings();

  const [ref, setRef] = useState(repoInfo.data?.default_branch);
  const [inputsData, setInputsData] = useState({});

  useEffect(() => {
    if (!ref) setRef(repoInfo.data?.default_branch);
  }, [ref, repoInfo]);

  const branchOptions = branches.data?.map((branch) => ({ label: branch.name, value: branch.name })) ?? [];

  const workflowInputs = useGithubWorkflowInputs(workflow?.path, ref);

  const inputs = workflowInputs?.map((input) => {
    let label = input.description ?? input.id;
    if (input.required) label += " (required)";
    return (
      <FormField key={input.id} label={label}>
        <Input
          name={input.id}
          value={inputsData[input.id] ?? input.default ?? ""}
          required={input.required || false}
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
            value={ref ?? repoInfo.data?.default_branch}
            onChange={(newValue) => setRef(newValue)}
            width="100%"
          />
        )}
      </FormField>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runWorkflow(workflow.id, ref, inputsData, settings).then(() => onClose(true));
        }}
      >
        {inputs}
        <Box paddingTop="1em">
          <Button disabled={branches.loading || repoInfo.loading} type="submit">
            Run workflow
          </Button>
        </Box>
      </form>
    </Dialog>
  );
}
