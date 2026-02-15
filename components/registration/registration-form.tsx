"use client";

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendIcon from "@mui/icons-material/Send";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import theme from "@/lib/mui-theme";
import { FORM_STEPS, STEP_LABELS, UI_LABELS } from "@/lib/form-config";
import {
  stepSchemas,
  fullSchema,
  formDefaultValues,
  type RegistrationFormData,
} from "@/lib/form-schema";
import { submitRegistration } from "@/lib/mock-service";
import DynamicStep from "./dynamic-step";
import DynamicReviewStep from "./dynamic-review-step";

// ── Total steps = config steps + review step ─────────────────────────────────

const TOTAL_STEPS = STEP_LABELS.length;
const REVIEW_INDEX = TOTAL_STEPS - 1;

// ── Stepper component ────────────────────────────────────────────────────────

function FormStepper({ activeStep }: { activeStep: number }) {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel={!isMobile}
      orientation={isMobile ? "vertical" : "horizontal"}
      sx={{
        "& .MuiStepConnector-line": { borderColor: "divider" },
      }}
    >
      {STEP_LABELS.map((label) => (
        <Step key={label}>
          <StepLabel
            sx={{
              "& .MuiStepLabel-label": {
                fontSize: { xs: "0.75rem", sm: "0.85rem" },
                fontWeight: 500,
              },
            }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

// ── Success screen with "Register New" ───────────────────────────────────────

function SuccessScreen({
  userId,
  onRegisterNew,
}: {
  userId: string;
  onRegisterNew: () => void;
}) {
  return (
    <Fade in timeout={500}>
      <Box sx={{ textAlign: "center", py: { xs: 4, md: 6 } }}>
        <CheckCircleIcon
          sx={{ fontSize: 80, color: "success.main", mb: 2 }}
        />
        <Typography variant="h4" sx={{ mb: 1, color: "text.primary" }}>
          {UI_LABELS.successTitle}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mb: 3 }}
        >
          {UI_LABELS.successMessage}
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            display: "inline-block",
            px: 4,
            py: 2,
            borderRadius: 3,
            bgcolor: "success.main",
            mb: 3,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#FFFFFF", fontWeight: 500 }}
          >
            {UI_LABELS.userIdLabel}
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: "#FFFFFF", fontWeight: 700 }}
          >
            {userId}
          </Typography>
        </Paper>
        <Box>
          <Button
            variant="contained"
            startIcon={<RestartAltIcon />}
            onClick={onRegisterNew}
            sx={{ px: 4 }}
          >
            {UI_LABELS.registerNewButton}
          </Button>
        </Box>
      </Box>
    </Fade>
  );
}

// ── Step content router ──────────────────────────────────────────────────────

function StepContent({ step }: { step: number }) {
  if (step === REVIEW_INDEX) {
    return <DynamicReviewStep />;
  }
  const stepConfig = FORM_STEPS[step];
  if (!stepConfig) return null;
  return <DynamicStep stepConfig={stepConfig} />;
}

// ── Main form wrapper ────────────────────────────────────────────────────────

export function RegistrationFormWrapper() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const methods = useForm<RegistrationFormData>({
    defaultValues: formDefaultValues,
    resolver: zodResolver(fullSchema),
    mode: "onTouched",
  });

  // ── Validate current step using config-derived schema ──────────────────

  const validateStep = useCallback(async () => {
    if (activeStep === REVIEW_INDEX) return true;

    const currentSchema = stepSchemas[activeStep];
    if (!currentSchema) return true;

    const values = methods.getValues();

    try {
      currentSchema.parse(values);
      // Clear errors for this step's fields
      const stepId = FORM_STEPS[activeStep].id;
      const stepFields = FORM_STEPS[activeStep].fields;
      for (const field of stepFields) {
        methods.clearErrors(`${stepId}.${field.name}` as never);
      }
      // Clear array section errors
      const arraySections = FORM_STEPS[activeStep].arraySections;
      if (arraySections) {
        for (const section of arraySections) {
          methods.clearErrors(`${stepId}.${section.name}` as never);
        }
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          methods.setError(path as never, { message: err.message });
        });
      }
      return false;
    }
  }, [activeStep, methods]);

  // ── Navigation ─────────────────────────────────────────────────────────

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setSubmitError(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const data = methods.getValues();
      const result = await submitRegistration(data);

      if (result.success) {
        setSubmitSuccess(result.userId || "");
      } else {
        setSubmitError(result.message);
      }
    } catch {
      setSubmitError(UI_LABELS.submitErrorFallback);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Register New — reset everything ────────────────────────────────────

  const handleRegisterNew = () => {
    methods.reset(formDefaultValues);
    setActiveStep(0);
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  const isLastStep = activeStep === REVIEW_INDEX;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FormProvider {...methods}>
        <Box
          className="registration-bg"
          sx={{
            minHeight: "100vh",
            py: { xs: 2, sm: 4, md: 6 },
            px: { xs: 1.5, sm: 2 },
          }}
        >
          {/* Decorative orbs */}
          <Box className="orb-decoration orb-1" />
          <Box className="orb-decoration orb-2" />
          <Box className="orb-decoration orb-3" />
          <Box className="grid-pattern" />

          <Container maxWidth="md" className="registration-content">
            {/* Header */}
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{ mb: { xs: 3, md: 4 } }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.3)",
                }}
              >
                <HowToRegIcon
                  sx={{ fontSize: 28, color: "#FFFFFF" }}
                />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: "text.primary",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {UI_LABELS.formTitle}
              </Typography>
            </Stack>

            {/* Stepper */}
            {!submitSuccess && (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
                }}
              >
                <FormStepper activeStep={activeStep} />
              </Paper>
            )}

            {/* Form Card */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                mt: { xs: 2, md: 3 },
                borderRadius: 4,
                minHeight: 300,
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
              }}
            >
              {submitSuccess ? (
                <SuccessScreen
                  userId={submitSuccess}
                  onRegisterNew={handleRegisterNew}
                />
              ) : (
                <>
                  <Fade in key={activeStep} timeout={300}>
                    <Box>
                      <StepContent step={activeStep} />
                    </Box>
                  </Fade>

                  {submitError && (
                    <Alert
                      severity="error"
                      sx={{ mt: 3, borderRadius: 2 }}
                    >
                      {submitError}
                    </Alert>
                  )}

                  {/* Navigation Buttons */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      mt: 4,
                      pt: 2,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={activeStep === 0 || isSubmitting}
                      startIcon={<ArrowBackIcon />}
                      sx={{
                        visibility:
                          activeStep === 0 ? "hidden" : "visible",
                      }}
                    >
                      {UI_LABELS.backButton}
                    </Button>

                    {isLastStep ? (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        endIcon={
                          isSubmitting ? (
                            <CircularProgress
                              size={18}
                              color="inherit"
                            />
                          ) : (
                            <SendIcon />
                          )
                        }
                        sx={{ px: 4 }}
                      >
                        {isSubmitting
                          ? UI_LABELS.submittingButton
                          : UI_LABELS.submitButton}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        endIcon={<ArrowForwardIcon />}
                      >
                        {UI_LABELS.continueButton}
                      </Button>
                    )}
                  </Stack>
                </>
              )}
            </Paper>
          </Container>
        </Box>
      </FormProvider>
    </ThemeProvider>
  );
}
