"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WorkIcon from "@mui/icons-material/Work";
import FolderIcon from "@mui/icons-material/Folder";
import type { StepConfig, ArraySectionConfig } from "@/lib/form-config";
import DynamicField from "./dynamic-field-renderer";

// ── Icon map for section headers ─────────────────────────────────────────────

const SECTION_ICON_MAP: Record<string, React.ReactNode> = {
  Work: <WorkIcon fontSize="small" color="primary" />,
  Folder: <FolderIcon fontSize="small" color="primary" />,
};

// ── Array section sub-component ──────────────────────────────────────────────

function DynamicArraySection({
  section,
  stepId,
}: {
  section: ArraySectionConfig;
  stepId: string;
}) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const arrayPath = `${stepId}.${section.name}`;

  const { fields, append, remove } = useFieldArray({
    control,
    name: arrayPath,
  });

  const addItem = () => {
    append({ ...section.defaultItem });
  };

  // Get root-level array error (e.g. min items)
  const stepErrors = (errors as Record<string, Record<string, unknown>>)?.[stepId];
  const sectionErrors = stepErrors?.[section.name] as
    | { root?: { message?: string } }
    | undefined;

  return (
    <Box>
      <Divider sx={{ mb: 2.5 }} />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          {section.icon && SECTION_ICON_MAP[section.icon]}
          {section.label}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircleOutlineIcon />}
          onClick={addItem}
        >
          {section.addButtonLabel}
        </Button>
      </Stack>

      {sectionErrors?.root?.message && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          {sectionErrors.root.message}
        </Typography>
      )}

      {fields.map((field, index) => (
        <Paper
          key={field.id}
          variant="outlined"
          sx={{
            p: { xs: 2, sm: 2.5 },
            mb: 2,
            position: "relative",
            borderRadius: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              {`${section.itemLabel} ${index + 1}`}
            </Typography>
            {fields.length > 1 && (
              <IconButton
                size="small"
                color="error"
                onClick={() => remove(index)}
                aria-label={`Remove ${section.itemLabel.toLowerCase()}`}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>

          <Grid container spacing={2}>
            {section.fields.map((fieldCfg) => {
              const fieldPath = `${arrayPath}.${index}.${fieldCfg.name}`;

              // Resolve dependsOn for this array item
              let isDisabled = false;
              if (fieldCfg.dependsOn) {
                const depPath = `${arrayPath}.${index}.${fieldCfg.dependsOn}`;
                const depValue = watch(depPath);
                isDisabled = fieldCfg.dependsOnReverse
                  ? !depValue
                  : !!depValue;
              }

              return (
                <Grid
                  item
                  xs={12}
                  sm={
                    fieldCfg.gridCols && fieldCfg.gridCols < 12
                      ? fieldCfg.gridCols
                      : 12
                  }
                  key={fieldCfg.name}
                >
                  <DynamicField
                    fieldConfig={fieldCfg}
                    fieldPath={fieldPath}
                    compact
                    isDisabled={isDisabled}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
}

// ── Main dynamic step component ──────────────────────────────────────────────

export default function DynamicStep({ stepConfig }: { stepConfig: StepConfig }) {
  const { watch } = useFormContext();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5, color: "text.primary" }}>
        {stepConfig.title}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        {stepConfig.subtitle}
      </Typography>

      <Grid container spacing={2.5}>
        {stepConfig.fields.map((fieldCfg) => {
          const fieldPath = `${stepConfig.id}.${fieldCfg.name}`;

          let isDisabled = false;
          if (fieldCfg.dependsOn) {
            const depPath = `${stepConfig.id}.${fieldCfg.dependsOn}`;
            const depValue = watch(depPath);
            isDisabled = fieldCfg.dependsOnReverse
              ? !depValue
              : !!depValue;
          }

          return (
            <Grid
              item
              xs={12}
              sm={
                fieldCfg.gridCols && fieldCfg.gridCols < 12
                  ? fieldCfg.gridCols
                  : 12
              }
              key={fieldCfg.name}
            >
              <DynamicField
                fieldConfig={fieldCfg}
                fieldPath={fieldPath}
                isDisabled={isDisabled}
              />
            </Grid>
          );
        })}
      </Grid>

      {stepConfig.arraySections?.map((section) => (
        <DynamicArraySection
          key={section.name}
          section={section}
          stepId={stepConfig.id}
        />
      ))}
    </Box>
  );
}
