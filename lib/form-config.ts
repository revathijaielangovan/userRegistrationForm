// ═══════════════════════════════════════════════════════════════════════════════
// FORM CONFIG — Single source of truth for the entire registration form.
// To add/remove/reorder fields or steps, ONLY edit this file.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Field type union ─────────────────────────────────────────────────────────

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

// ── Validation rule config ───────────────────────────────────────────────────

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: { value: string; flags?: string };
  isEmail?: boolean;
  isUrl?: boolean;
  custom?: string; // reserved for future use
}

// ── Single field config ──────────────────────────────────────────────────────

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  gridCols?: number; // 1–12 on a 12-col grid; defaults to 12
  validation?: ValidationRule;
  errorMessages?: Record<string, string>;
  options?: { value: string; label: string }[];
  accept?: string; // for file fields, e.g. "image/*"
  multiline?: boolean;
  rows?: number;
  icon?: string; // MUI icon name hint, used by the renderer
  dependsOn?: string; // field name that disables this field
  dependsOnReverse?: boolean; // invert dependsOn logic
}

// ── Dynamic array section config ─────────────────────────────────────────────

export interface ArraySectionConfig {
  name: string; // field array path segment
  label: string;
  addButtonLabel: string;
  itemLabel: string; // e.g. "Experience" → "Experience 1", "Experience 2"
  minItems: number;
  minItemsError: string;
  icon?: string;
  fields: FieldConfig[];
  defaultItem: Record<string, unknown>;
}

// ── Step config ──────────────────────────────────────────────────────────────

export interface StepConfig {
  id: string; // unique key and form data namespace
  label: string;
  title: string;
  subtitle: string;
  icon?: string;
  fields: FieldConfig[];
  arraySections?: ArraySectionConfig[];
}

// ── UI labels / copy driven from config ──────────────────────────────────────

export const UI_LABELS = {
  formTitle: "Create Your Profile",
  backButton: "Back",
  continueButton: "Continue",
  submitButton: "Submit Registration",
  submittingButton: "Submitting...",
  successTitle: "Registration Complete!",
  successMessage: "Your profile has been created successfully.",
  userIdLabel: "User ID",
  registerNewButton: "Register New Profile",
  submitErrorFallback: "An unexpected error occurred. Please try again.",
  reviewStepTitle: "Review & Submit",
  reviewStepSubtitle: "Please review your information before submitting.",
} as const;

// ── Dropdown / select data (reusable across fields) ──────────────────────────

export const SELECT_OPTIONS = {
  gender: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ],
  states: [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming",
  ].map((s) => ({ value: s, label: s })),
  countries: [
    "United States", "Canada", "United Kingdom", "Australia", "Germany",
    "France", "India", "Japan", "Brazil", "Mexico", "Spain", "Italy",
    "Netherlands", "Sweden", "Switzerland", "Singapore", "South Korea",
  ].map((c) => ({ value: c, label: c })),
  yearsOfExperience: [
    "0-1 years", "1-3 years", "3-5 years", "5-10 years", "10-15 years", "15+ years",
  ].map((y) => ({ value: y, label: y })),
  industries: [
    "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
    "Retail", "Media & Entertainment", "Real Estate", "Consulting",
    "Government", "Non-Profit", "Agriculture", "Transportation",
    "Energy", "Telecommunications",
  ].map((i) => ({ value: i, label: i })),
  employmentType: [
    { value: "full-time", label: "Full-Time" },
    { value: "part-time", label: "Part-Time" },
    { value: "contract", label: "Contract" },
    { value: "freelance", label: "Freelance" },
    { value: "internship", label: "Internship" },
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// STEP DEFINITIONS
// Add / remove / reorder any step or field here and the form adapts.
// ═══════════════════════════════════════════════════════════════════════════════

export const FORM_STEPS: StepConfig[] = [
  // ── Step 1: Personal Details ─────────────────────────────────────────────
  {
    id: "personalDetails",
    label: "Personal Details",
    title: "Personal Details",
    subtitle: "Tell us about yourself to get started.",
    icon: "Person",
    fields: [
      {
        name: "profilePhoto",
        label: "Profile Photo",
        type: "file",
        accept: "image/*",
        gridCols: 12,
      },
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "John",
        required: true,
        gridCols: 6,
        validation: { required: true, minLength: 2 },
        errorMessages: {
          required: "First name is required",
          minLength: "First name must be at least 2 characters",
        },
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Doe",
        required: true,
        gridCols: 6,
        validation: { required: true, minLength: 2 },
        errorMessages: {
          required: "Last name is required",
          minLength: "Last name must be at least 2 characters",
        },
      },
      {
        name: "dateOfBirth",
        label: "Date of Birth",
        type: "date",
        required: true,
        gridCols: 12,
        validation: { required: true },
        errorMessages: { required: "Date of birth is required" },
      },
      {
        name: "gender",
        label: "Gender",
        type: "radio",
        required: true,
        gridCols: 12,
        options: [...SELECT_OPTIONS.gender],
        validation: { required: true },
        errorMessages: { required: "Please select a gender" },
      },
    ],
  },

  // ── Step 2: Contact Details ──────────────────────────────────────────────
  {
    id: "contactDetails",
    label: "Contact Details",
    title: "Contact Details",
    subtitle: "How can we reach you? All fields are required.",
    icon: "ContactMail",
    fields: [
      {
        name: "email",
        label: "Email Address",
        type: "email",
        placeholder: "john@example.com",
        required: true,
        gridCols: 6,
        icon: "Email",
        validation: { required: true, isEmail: true },
        errorMessages: {
          required: "Email is required",
          isEmail: "Please enter a valid email address",
        },
      },
      {
        name: "phone",
        label: "Phone Number",
        type: "tel",
        placeholder: "+1 (555) 000-0000",
        required: true,
        gridCols: 6,
        icon: "Phone",
        validation: {
          required: true,
          minLength: 10,
          pattern: { value: "^[0-9+\\-() ]+$" },
        },
        errorMessages: {
          required: "Phone number is required",
          minLength: "Phone number must be at least 10 digits",
          pattern: "Please enter a valid phone number",
        },
      },
      {
        name: "address",
        label: "Street Address",
        type: "textarea",
        placeholder: "123 Main St, Apt 4B",
        required: true,
        gridCols: 12,
        rows: 2,
        icon: "LocationOn",
        validation: { required: true, minLength: 5 },
        errorMessages: {
          required: "Address is required",
          minLength: "Address must be at least 5 characters",
        },
      },
      {
        name: "city",
        label: "City",
        type: "text",
        required: true,
        gridCols: 6,
        validation: { required: true, minLength: 2 },
        errorMessages: {
          required: "City is required",
          minLength: "City is required",
        },
      },
      {
        name: "state",
        label: "State",
        type: "select",
        required: true,
        gridCols: 6,
        options: [...SELECT_OPTIONS.states],
        validation: { required: true },
        errorMessages: { required: "Please select a state" },
      },
      {
        name: "zipCode",
        label: "ZIP Code",
        type: "text",
        required: true,
        gridCols: 6,
        validation: {
          required: true,
          minLength: 5,
          pattern: { value: "^[0-9-]+$" },
        },
        errorMessages: {
          required: "ZIP code is required",
          minLength: "ZIP code must be at least 5 characters",
          pattern: "Please enter a valid ZIP code",
        },
      },
      {
        name: "country",
        label: "Country",
        type: "select",
        required: true,
        gridCols: 6,
        options: [...SELECT_OPTIONS.countries],
        validation: { required: true },
        errorMessages: { required: "Please select a country" },
      },
    ],
  },

  // ── Step 3: Professional Experience ──────────────────────────────────────
  {
    id: "professionalExperience",
    label: "Professional Experience",
    title: "Professional Experience",
    subtitle: "Share your work history and professional background.",
    icon: "Work",
    fields: [
      {
        name: "currentJobTitle",
        label: "Current Job Title",
        type: "text",
        required: true,
        gridCols: 6,
        validation: { required: true, minLength: 2 },
        errorMessages: {
          required: "Current job title is required",
          minLength: "Current job title is required",
        },
      },
      {
        name: "yearsOfExperience",
        label: "Years of Experience",
        type: "select",
        required: true,
        gridCols: 6,
        options: [...SELECT_OPTIONS.yearsOfExperience],
        validation: { required: true },
        errorMessages: { required: "Please select years of experience" },
      },
      {
        name: "industry",
        label: "Industry",
        type: "select",
        required: true,
        gridCols: 6,
        options: [...SELECT_OPTIONS.industries],
        validation: { required: true },
        errorMessages: { required: "Please select an industry" },
      },
      {
        name: "skills",
        label: "Skills (comma-separated)",
        type: "text",
        placeholder: "React, TypeScript, Node.js...",
        required: true,
        gridCols: 6,
        validation: { required: true, minLength: 2 },
        errorMessages: {
          required: "Please enter at least one skill",
          minLength: "Please enter at least one skill",
        },
      },
      {
        name: "resume",
        label: "Upload Resume",
        type: "file",
        accept: ".pdf,.doc,.docx",
        gridCols: 12,
      },
    ],
    arraySections: [
      {
        name: "experiences",
        label: "Work Experience",
        addButtonLabel: "Add Experience",
        itemLabel: "Experience",
        icon: "Work",
        minItems: 1,
        minItemsError: "Add at least one experience entry",
        defaultItem: {
          company: "",
          jobTitle: "",
          employmentType: "full-time",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          description: "",
        },
        fields: [
          {
            name: "company",
            label: "Company",
            type: "text",
            required: true,
            gridCols: 6,
            validation: { required: true, minLength: 2 },
            errorMessages: { required: "Company name is required", minLength: "Company name is required" },
          },
          {
            name: "jobTitle",
            label: "Job Title",
            type: "text",
            required: true,
            gridCols: 6,
            validation: { required: true, minLength: 2 },
            errorMessages: { required: "Job title is required", minLength: "Job title is required" },
          },
          {
            name: "employmentType",
            label: "Employment Type",
            type: "select",
            required: true,
            gridCols: 12,
            options: [...SELECT_OPTIONS.employmentType],
            validation: { required: true },
            errorMessages: { required: "Please select employment type" },
          },
          {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true,
            gridCols: 6,
            validation: { required: true },
            errorMessages: { required: "Start date is required" },
          },
          {
            name: "endDate",
            label: "End Date",
            type: "date",
            gridCols: 6,
            dependsOn: "currentlyWorking",
          },
          {
            name: "currentlyWorking",
            label: "I currently work here",
            type: "checkbox",
            gridCols: 12,
          },
          {
            name: "description",
            label: "Description (optional)",
            type: "textarea",
            rows: 2,
            placeholder: "Describe your responsibilities and achievements...",
            gridCols: 12,
          },
        ],
      },
    ],
  },

  // ── Step 4: Projects ─────────────────────────────────────────────────────
  {
    id: "projects",
    label: "Projects",
    title: "Projects",
    subtitle: "Showcase your best work and side projects.",
    icon: "Folder",
    fields: [
      {
        name: "portfolioUrl",
        label: "Portfolio URL (optional)",
        type: "text",
        placeholder: "https://yourportfolio.com",
        gridCols: 12,
        validation: { isUrl: true },
        errorMessages: { isUrl: "Please enter a valid URL" },
      },
      {
        name: "openToCollaboration",
        label: "I'm open to collaboration on projects",
        type: "checkbox",
        gridCols: 12,
      },
    ],
    arraySections: [
      {
        name: "projects",
        label: "Project Entries",
        addButtonLabel: "Add Project",
        itemLabel: "Project",
        icon: "Folder",
        minItems: 1,
        minItemsError: "Add at least one project",
        defaultItem: {
          projectName: "",
          role: "",
          description: "",
          technologies: "",
          projectUrl: "",
          startDate: "",
          endDate: "",
          ongoing: false,
        },
        fields: [
          {
            name: "projectName",
            label: "Project Name",
            type: "text",
            required: true,
            gridCols: 6,
            validation: { required: true, minLength: 2 },
            errorMessages: { required: "Project name is required", minLength: "Project name is required" },
          },
          {
            name: "role",
            label: "Your Role",
            type: "text",
            required: true,
            gridCols: 6,
            validation: { required: true, minLength: 2 },
            errorMessages: { required: "Your role is required", minLength: "Your role is required" },
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            rows: 3,
            placeholder: "Describe the project, your contributions, and outcomes...",
            required: true,
            gridCols: 12,
            validation: { required: true, minLength: 10 },
            errorMessages: {
              required: "Description is required",
              minLength: "Description must be at least 10 characters",
            },
          },
          {
            name: "technologies",
            label: "Technologies",
            type: "text",
            placeholder: "React, Node.js, PostgreSQL...",
            required: true,
            gridCols: 6,
            validation: { required: true, minLength: 2 },
            errorMessages: { required: "Please list technologies used", minLength: "Please list technologies used" },
          },
          {
            name: "projectUrl",
            label: "Project URL (optional)",
            type: "text",
            placeholder: "https://...",
            gridCols: 6,
            validation: { isUrl: true },
            errorMessages: { isUrl: "Please enter a valid URL" },
          },
          {
            name: "startDate",
            label: "Start Date",
            type: "date",
            required: true,
            gridCols: 6,
            validation: { required: true },
            errorMessages: { required: "Start date is required" },
          },
          {
            name: "endDate",
            label: "End Date",
            type: "date",
            gridCols: 6,
            dependsOn: "ongoing",
          },
          {
            name: "ongoing",
            label: "This project is ongoing",
            type: "checkbox",
            gridCols: 12,
          },
        ],
      },
    ],
  },
];

// Derived step labels (for stepper)
export const STEP_LABELS = [
  ...FORM_STEPS.map((s) => s.label),
  UI_LABELS.reviewStepTitle,
];
