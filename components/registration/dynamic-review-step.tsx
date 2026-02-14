"use client";

import { useFormContext } from "react-hook-form";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import PersonIcon from "@mui/icons-material/Person";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import WorkIcon from "@mui/icons-material/Work";
import FolderIcon from "@mui/icons-material/Folder";
import { FORM_STEPS, UI_LABELS } from "@/lib/form-config";
import type { StepConfig, ArraySectionConfig } from "@/lib/form-config";

// ── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Person: <PersonIcon color="primary" />,
  ContactMail: <ContactMailIcon color="primary" />,
  Work: <WorkIcon color="primary" />,
  Folder: <FolderIcon color="primary" />,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
      {icon}
      <Typography variant="h6" sx={{ color: "text.primary" }}>
        {title}
      </Typography>
    </Stack>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0, sm: 1 }}
      sx={{ mb: 0.75 }}
    >
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", minWidth: 160, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary" }}>
        {value || "\u2014"}
      </Typography>
    </Stack>
  );
}

function formatValue(value: unknown): string {
  if (value == null || value === "") return "\u2014";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    // Capitalize and clean up
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
  }
  return String(value);
}

function isCommaSeparatedList(name: string): boolean {
  return ["skills", "technologies"].includes(name);
}

// ── Render fields for a step ─────────────────────────────────────────────────

function ReviewFields({
  stepConfig,
  data,
}: {
  stepConfig: StepConfig;
  data: Record<string, unknown>;
}) {
  return (
    <>
      {stepConfig.fields
        .filter(
          (f) => f.type !== "file" && f.type !== "checkbox" && data[f.name]
        )
        .map((f) => {
          if (isCommaSeparatedList(f.name)) {
            const items = String(data[f.name] ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            return (
              <Box key={f.name} sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 500,
                    mb: 0.5,
                  }}
                >
                  {f.label}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.75}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {items.map((item, i) => (
                    <Chip
                      key={i}
                      label={item}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>
            );
          }
          return (
            <InfoRow
              key={f.name}
              label={f.label.replace(" *", "")}
              value={formatValue(data[f.name])}
            />
          );
        })}

      {/* Checkboxes */}
      {stepConfig.fields
        .filter((f) => f.type === "checkbox")
        .map((f) => (
          <InfoRow
            key={f.name}
            label={f.label}
            value={data[f.name] ? "Yes" : "No"}
          />
        ))}
    </>
  );
}

// ── Render array section items ───────────────────────────────────────────────

function ReviewArraySection({
  section,
  items,
}: {
  section: ArraySectionConfig;
  items: Record<string, unknown>[];
}) {
  if (!items?.length) return null;

  return (
    <>
      <Divider sx={{ my: 1.5 }} />
      {items.map((item, i) => (
        <Box
          key={i}
          sx={{
            mb: i < items.length - 1 ? 1.5 : 0,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
            {`${section.itemLabel} ${i + 1}`}
          </Typography>
          {section.fields
            .filter(
              (f) =>
                f.type !== "checkbox" &&
                f.type !== "file" &&
                item[f.name] != null &&
                item[f.name] !== ""
            )
            .map((f) => {
              if (isCommaSeparatedList(f.name)) {
                const techs = String(item[f.name])
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                return (
                  <Stack
                    key={f.name}
                    direction="row"
                    spacing={0.75}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 0.5 }}
                  >
                    {techs.map((t, j) => (
                      <Chip
                        key={j}
                        label={t}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Stack>
                );
              }
              return (
                <Typography
                  key={f.name}
                  variant="caption"
                  sx={{ color: "text.secondary", display: "block" }}
                >
                  {`${f.label}: ${formatValue(item[f.name])}`}
                </Typography>
              );
            })}
          {section.fields
            .filter((f) => f.type === "checkbox" && item[f.name])
            .map((f) => (
              <Typography
                key={f.name}
                variant="caption"
                sx={{ color: "text.secondary", display: "block" }}
              >
                {f.label}
              </Typography>
            ))}
        </Box>
      ))}
    </>
  );
}

// ── Main review step ─────────────────────────────────────────────────────────

export default function DynamicReviewStep() {
  const { getValues } = useFormContext();
  const allData = getValues();

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 0.5, color: "text.primary" }}>
        {UI_LABELS.reviewStepTitle}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        {UI_LABELS.reviewStepSubtitle}
      </Typography>

      {FORM_STEPS.map((step) => {
        const stepData = (allData[step.id] ?? {}) as Record<string, unknown>;

        return (
          <Paper
            key={step.id}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 3 },
              mb: 2.5,
              borderRadius: 3,
            }}
          >
            <SectionHeader
              icon={
                step.icon && ICON_MAP[step.icon] ? (
                  ICON_MAP[step.icon]
                ) : (
                  <PersonIcon color="primary" />
                )
              }
              title={step.label}
            />
            <ReviewFields stepConfig={step} data={stepData} />
            {step.arraySections?.map((section) => (
              <ReviewArraySection
                key={section.name}
                section={section}
                items={
                  (stepData[section.name] as Record<string, unknown>[]) ?? []
                }
              />
            ))}
          </Paper>
        );
      })}
    </Box>
  );
}
