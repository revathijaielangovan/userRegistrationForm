"use client";

import { Controller, useFormContext } from "react-hook-form";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Checkbox from "@mui/material/Checkbox";
import FormHelperText from "@mui/material/FormHelperText";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useRef, useState } from "react";
import type { FieldConfig } from "@/lib/form-config";

// ── Icon map for input adornments ────────────────────────────────────────────

const ICON_MAP: Record<string, React.ReactNode> = {
  Email: <EmailIcon fontSize="small" sx={{ color: "text.secondary" }} />,
  Phone: <PhoneIcon fontSize="small" sx={{ color: "text.secondary" }} />,
  LocationOn: (
    <LocationOnIcon fontSize="small" sx={{ color: "text.secondary" }} />
  ),
};

// ── Utility to resolve nested errors ─────────────────────────────────────────

function getNestedError(
  errors: Record<string, unknown>,
  path: string
): { message?: string } | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current as { message?: string } | undefined;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface DynamicFieldProps {
  fieldConfig: FieldConfig;
  /** Full dotted path for react-hook-form, e.g. "personalDetails.firstName" */
  fieldPath: string;
  /** Compact size for array section items */
  compact?: boolean;
  /** If true, the field is disabled (from dependsOn logic) */
  isDisabled?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DynamicField({
  fieldConfig,
  fieldPath,
  compact = false,
  isDisabled = false,
}: DynamicFieldProps) {
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext();

  const error = getNestedError(
    errors as unknown as Record<string, unknown>,
    fieldPath
  );
  const hasError = !!error;
  const errorMsg = error?.message ?? "";
  const size = compact ? "small" : "medium";

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const startAdornment =
    fieldConfig.icon && ICON_MAP[fieldConfig.icon] ? (
      <InputAdornment
        position="start"
        sx={
          fieldConfig.type === "textarea"
            ? { alignSelf: "flex-start", mt: 1.5 }
            : undefined
        }
      >
        {ICON_MAP[fieldConfig.icon]}
      </InputAdornment>
    ) : undefined;

  // ── File upload ────────────────────────────────────────────────────────

  if (fieldConfig.type === "file") {
    const isImage = fieldConfig.accept?.includes("image");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setValue(fieldPath, file);
      setFileName(file.name);
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (ev) =>
          setPhotoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
      }
    };

    return (
      <Box>
        <input
          ref={fileInputRef}
          type="file"
          accept={fieldConfig.accept}
          hidden
          onChange={handleFileChange}
        />
        {isImage ? (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Avatar
              src={photoPreview || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.light",
                border: "3px solid",
                borderColor: "primary.main",
              }}
            >
              <PersonIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ fontSize: "0.75rem" }}
            >
              {fieldConfig.label}
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              size={compact ? "small" : "medium"}
            >
              {fieldConfig.label}
            </Button>
            {fileName && (
              <Chip
                label={fileName}
                size="small"
                onDelete={() => {
                  setFileName(null);
                  setValue(fieldPath, undefined);
                }}
              />
            )}
          </Stack>
        )}
      </Box>
    );
  }

  // ── Checkbox ───────────────────────────────────────────────────────────

  if (fieldConfig.type === "checkbox") {
    return (
      <Controller
        name={fieldPath}
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                color="primary"
              />
            }
            label={fieldConfig.label}
          />
        )}
      />
    );
  }

  // ── Radio group ────────────────────────────────────────────────────────

  if (fieldConfig.type === "radio") {
    return (
      <Controller
        name={fieldPath}
        control={control}
        render={({ field }) => (
          <FormControl error={hasError} component="fieldset">
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 0.5 }}>
              {fieldConfig.label}
              {fieldConfig.required ? " *" : ""}
            </FormLabel>
            <RadioGroup {...field} row>
              {fieldConfig.options?.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                />
              ))}
            </RadioGroup>
            {hasError && <FormHelperText>{errorMsg}</FormHelperText>}
          </FormControl>
        )}
      />
    );
  }

  // ── Select / Dropdown ──────────────────────────────────────────────────

  if (fieldConfig.type === "select") {
    return (
      <Controller
        name={fieldPath}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label={fieldConfig.label}
            select
            fullWidth
            required={fieldConfig.required}
            disabled={isDisabled}
            size={size}
            error={hasError}
            helperText={errorMsg}
          >
            <MenuItem value="" disabled>
              {`Select ${fieldConfig.label.toLowerCase()}`}
            </MenuItem>
            {fieldConfig.options?.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
    );
  }

  // ── Text / Email / Tel / Date / Textarea ───────────────────────────────

  return (
    <Controller
      name={fieldPath}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          label={fieldConfig.label}
          type={
            fieldConfig.type === "textarea" ? "text" : fieldConfig.type
          }
          multiline={
            fieldConfig.type === "textarea" || fieldConfig.multiline
          }
          rows={fieldConfig.rows}
          fullWidth
          required={fieldConfig.required}
          disabled={isDisabled}
          size={size}
          placeholder={fieldConfig.placeholder}
          error={hasError}
          helperText={errorMsg}
          InputLabelProps={
            fieldConfig.type === "date" ? { shrink: true } : undefined
          }
          InputProps={
            startAdornment ? { startAdornment } : undefined
          }
        />
      )}
    />
  );
}
