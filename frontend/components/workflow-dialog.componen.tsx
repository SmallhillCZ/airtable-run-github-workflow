import { Box, Button, Dialog, FormField, Heading, Input, Select, SelectButtons } from "@airtable/blocks/ui";
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
  const [invalidInputsDialogOpen, setInvalidInputsDialogOpen] = useState(false);

  useEffect(() => {
    if (!ref) setRef(repoInfo.data?.default_branch);
  }, [ref, repoInfo]);

  const branchOptions = branches.data?.map((branch) => ({ label: branch.name, value: branch.name })) ?? [];

  const workflowInputs = useGithubWorkflowInputs(workflow?.path, ref);

  function validateInputs() {
    console.log("validateInputs", workflowInputs, inputsData);
    console.log(workflowInputs.every((input) => !input.required || inputsData[input.id] !== ""));
    return !workflowInputs.some(
      (input) => input.required && (inputsData[input.id] === undefined || inputsData[input.id] === "")
    );
  }

  const inputs = workflowInputs?.map((input) => {
    let label = input.description ?? input.id;
    if (input.required) label += " (required)";

    if (input.type === "choice") {
      const options = input.options?.map((choice) => ({ label: choice, value: choice })) ?? [];

      return (
        <FormField key={input.id} label={label}>
          <Select
            options={options}
            value={inputsData[input.id] ?? input.default ?? ""}
            onChange={(newValue) => {
              setInputsData((prev) => {
                return { ...prev, [input.id]: newValue };
              });
            }}
          />
        </FormField>
      );
    }

    if (input.type === "boolean") {
      return (
        <FormField key={input.id} label={label}>
          <SelectButtons
            options={[
              { label: "Yes", value: "true" },
              { label: "No", value: "false" },
            ]}
            value={inputsData[input.id] ?? input.default ?? "false"}
            onChange={(newValue) => {
              setInputsData((prev) => {
                return { ...prev, [input.id]: newValue };
              });
            }}
          />
        </FormField>
      );
    }

    return (
      <FormField key={input.id} label={label}>
        <Input
          name={input.id}
          type={input.type === "number" ? "number" : "text"}
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
          if (validateInputs()) {
            runWorkflow(workflow.id, ref, inputsData, settings).then(() => onClose(true));
          } else {
            setInvalidInputsDialogOpen(true);
          }
        }}
      >
        {inputs}

        <Box paddingTop="1em">
          <Button disabled={branches.loading || repoInfo.loading} type="submit" variant="primary">
            Run workflow
          </Button>
        </Box>
      </form>

      {invalidInputsDialogOpen && (
        <Dialog onClose={() => setInvalidInputsDialogOpen(false)}>
          <Dialog.CloseButton />
          <Heading>Invalid inputs</Heading>
          <Box padding="1em">
            <p>Please fill in all required inputs before running the workflow.</p>
          </Box>
          <Button onClick={() => setInvalidInputsDialogOpen(false)} variant="primary">
            OK
          </Button>
        </Dialog>
      )}
    </Dialog>
  );
}
