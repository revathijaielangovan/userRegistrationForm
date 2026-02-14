# Multi-Step Registration Form -- Complete Project Overview

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [File Structure](#file-structure)
3. [Layer 1: Config -- Single Source of Truth](#layer-1-config----single-source-of-truth)
4. [Layer 2: Dynamic Schema Builder](#layer-2-dynamic-schema-builder)
5. [Layer 3: Dynamic Field Renderer](#layer-3-dynamic-field-renderer)
6. [Layer 4: Dynamic Step Component](#layer-4-dynamic-step-component)
7. [Layer 5: Dynamic Review Step](#layer-5-dynamic-review-step)
8. [Layer 6: Main Orchestrator](#layer-6-main-orchestrator)
9. [Layer 7: Supporting Files](#layer-7-supporting-files)
10. [Material UI Components Reference](#material-ui-components-reference)
11. [TypeScript Usage and Reasoning](#typescript-usage-and-reasoning)
12. [React Hook Form Usage and Reasoning](#react-hook-form-usage-and-reasoning)
13. [How to Add / Remove Fields and Steps](#how-to-add--remove-fields-and-steps)
14. [Technology Summary Table](#technology-summary-table)

---

## Project Architecture

The project follows a **config-driven architecture** where a single configuration file (`lib/form-config.ts`) defines the entire form structure. Every label, field, dropdown option, validation rule, and error message is declared in config. The rest of the system reads from that config and dynamically generates:

- **Zod validation schemas** (per step and combined)
- **MUI input components** (text, select, radio, checkbox, file, etc.)
- **Step layouts** (grids, dynamic arrays, conditional fields)
- **Review summary** (auto-reads all config to display entered data)

This means adding, removing, or reordering a field requires editing **only the config file**. No component code changes needed.

---

## File Structure

```
app/
  page.tsx                        -- Next.js entry point, renders the form wrapper
  layout.tsx                      -- Root layout with SEO metadata
  globals.css                     -- Tailwind base + animated background CSS

lib/
  form-config.ts                  -- SINGLE SOURCE OF TRUTH for the entire form
  form-schema.ts                  -- Dynamically generates Zod schemas from config
  mock-service.ts                 -- Simulated backend API (submit + email check)
  mui-theme.ts                    -- Custom Material UI theme

components/registration/
  registration-form.tsx           -- Main orchestrator (stepper, navigation, submit, reset)
  dynamic-step.tsx                -- Renders any step from config (fields + array sections)
  dynamic-field-renderer.tsx      -- Renders any single field based on its FieldConfig
  dynamic-review-step.tsx         -- Renders a read-only summary of all entered data
```

---

## Layer 1: Config -- Single Source of Truth

**File:** `lib/form-config.ts`

This is the heart of the system. Every piece of UI text, every form field, every dropdown option, every validation rule, and every error message lives here.

### TypeScript Interfaces Defined

| Interface           | Purpose                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------- |
| `FieldType`         | Union type: `"text" \| "email" \| "tel" \| "date" \| "textarea" \| "select" \| "radio" \| "checkbox" \| "file"` -- constrains valid field types |
| `ValidationRule`    | Defines `required`, `minLength`, `maxLength`, `pattern`, `isEmail`, `isUrl` -- all optional              |
| `FieldConfig`       | Full definition of ONE input: `name`, `label`, `type`, `placeholder`, `gridCols`, `validation`, `errorMessages`, `options`, `accept`, `icon`, `dependsOn` |
| `ArraySectionConfig`| Dynamic repeatable sections (work experiences, projects): `name`, `label`, `addButtonLabel`, `itemLabel`, `minItems`, `fields[]`, `defaultItem` |
| `StepConfig`        | One complete step: `id`, `label`, `title`, `subtitle`, `icon`, `fields[]`, `arraySections[]`             |

### Exported Constants

#### `UI_LABELS`

All button labels, titles, and messages used across the app:

```typescript
export const UI_LABELS = {
  formTitle: "Create Your Profile",
  buttons: {
    next: "Continue",
    back: "Back",
    submit: "Submit Registration",
    submitting: "Submitting...",
    registerNew: "Register New Profile",
  },
  steps: { review: "Review" },
  success: {
    title: "Registration Successful!",
    message: "Your profile has been created successfully.",
    userIdLabel: "Your User ID",
  },
  review: {
    sectionPrefix: "",
    editHint: "Review your information before submitting",
    yes: "Yes",
    no: "No",
  },
};
```

#### `SELECT_OPTIONS`

Reusable dropdown data shared by multiple fields:

- `gender` -- Male, Female, Non-binary, Prefer not to say
- `states` -- US states (California, Texas, New York, Florida, Illinois)
- `countries` -- United States, Canada, United Kingdom, Australia, Germany, India
- `industries` -- Technology, Healthcare, Finance, Education, Manufacturing, Retail, Media
- `employmentTypes` -- Full-time, Part-time, Contract, Internship, Freelance

#### `FORM_STEPS`

The array of 4 `StepConfig` objects defining every step:

| Step # | ID                       | Label                    | Fields                                                             | Array Sections          |
| ------ | ------------------------ | ------------------------ | ------------------------------------------------------------------ | ----------------------- |
| 1      | `personalDetails`        | Personal Details         | profilePhoto (file), firstName (text), lastName (text), dateOfBirth (date), gender (radio) | None                    |
| 2      | `contactDetails`         | Contact Details          | email (email), phone (tel), address (textarea), city (text), state (select), zipCode (text), country (select) | None                    |
| 3      | `professionalExperience` | Professional Experience  | currentJobTitle (text), yearsOfExperience (select), industry (select), skills (text), resume (file) | `experiences` (7 fields per item) |
| 4      | `projects`               | Projects                 | portfolioUrl (text), openToCollaboration (checkbox)                | `projectList` (8 fields per item) |

Each array section item (e.g., one work experience) contains its own set of `FieldConfig` entries with full validation.

---

## Layer 2: Dynamic Schema Builder

**File:** `lib/form-schema.ts`

React Hook Form needs a Zod resolver for validation. Rather than hand-writing schemas for each step, this file reads `form-config.ts` at module load time and generates them dynamically.

### Key Functions

| Function                           | What It Does                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `buildFieldSchema(field)`          | Takes one `FieldConfig`, returns a `ZodTypeAny`. Checks `field.type` (checkbox = boolean, file = any.optional, everything else = string). Chains `.min()`, `.max()`, `.regex()`, `.email()`, `.url()` based on `field.validation` using error messages from `field.errorMessages`. |
| `buildArraySectionSchema(section)` | Builds `z.array(z.object({...})).min(section.minItems)` for repeatable sections.                         |
| `buildStepSchema(step)`            | Combines fields + array sections into one `z.object()` per step.                                         |

### Exports

| Export               | Type                        | Purpose                                                                 |
| -------------------- | --------------------------- | ----------------------------------------------------------------------- |
| `stepSchemas`        | `ZodObject[]`               | Array of per-step Zod schemas, used for step-by-step validation on "Continue" |
| `fullSchema`         | `ZodObject`                 | Combined schema across all steps, passed to `zodResolver()` for the form |
| `RegistrationFormData` | TypeScript type           | Derived via `z.infer<typeof fullSchema>` -- the form's data shape        |
| `formDefaultValues`  | `RegistrationFormData`      | Auto-generated defaults (empty strings, false for checkboxes, `[{...defaultItem}]` for arrays) |

### Why This Approach

When you add a field to `form-config.ts` with `validation: { required: true, minLength: 2 }` and `errorMessages: { required: "First name is required", minLength: "At least 2 characters" }`, the schema builder automatically creates:

```typescript
z.string().min(1, "First name is required").min(2, "At least 2 characters")
```

No manual schema updates needed.

---

## Layer 3: Dynamic Field Renderer

**File:** `components/registration/dynamic-field-renderer.tsx`

Takes one `FieldConfig` + a `fieldPath` string (e.g., `"personalDetails.firstName"`) and renders the correct MUI component.

### React Hook Form Integration

- **`useFormContext()`** -- Accesses the shared form instance from `FormProvider`. This is why the renderer does not need the form passed as a prop.
- **`Controller`** -- Wraps every MUI component. RHF's `Controller` bridges the gap between MUI's uncontrolled inputs and RHF's controlled state. Each `Controller` gets `name={fieldPath}`, `control={control}`, and renders the MUI component inside its `render` prop with `field.value` and `field.onChange`.

### MUI Components Per Field Type

| `field.type`                        | MUI Component(s)                                                  | Notes                                                          |
| ----------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `"text"`, `"email"`, `"tel"`, `"date"` | `TextField`                                                    | Uses `type` prop to switch input types. Date fields get `InputLabelProps={{ shrink: true }}` |
| `"textarea"`                        | `TextField` with `multiline` + `rows={3}`                         | Same component, different rendering mode                       |
| `"select"`                          | `TextField` with `select` + `MenuItem` children                   | MUI's built-in select-inside-textfield pattern                 |
| `"radio"`                           | `FormControl` + `FormLabel` + `RadioGroup` + `Radio` + `FormControlLabel` | Full accessible radio group with error via `FormHelperText` |
| `"checkbox"`                        | `Checkbox` + `FormControlLabel`                                   | Boolean toggle, `onChange` converts to `e.target.checked`      |
| `"file"`                            | `Button` (styled upload) + hidden `<input type="file">` + `Avatar` or `Chip` | Image uploads show `Avatar` preview; documents show `Chip` with filename and delete |

### Additional MUI Components

- `InputAdornment` -- Icon prefixes on email, phone, address fields
- `CloudUploadIcon`, `PersonIcon`, `EmailIcon`, `PhoneIcon`, `LocationOnIcon` -- Icons from `@mui/icons-material`

### TypeScript in This File

The `DynamicFieldProps` interface strictly types the props:

```typescript
interface DynamicFieldProps {
  config: FieldConfig;   // what to render
  fieldPath: string;     // where in form state (e.g. "contactDetails.email")
  isDisabled?: boolean;  // for conditional disable (dependsOn)
}
```

The `getNestedError()` utility navigates RHF's nested error object using the dot-path string, returning a typed `{ message?: string }`.

---

## Layer 4: Dynamic Step Component

**File:** `components/registration/dynamic-step.tsx`

Takes one `StepConfig` and renders all its `fields[]` using `DynamicField`, plus any `arraySections[]` as repeatable card groups.

### React Hook Form Integration

| RHF API            | Usage                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `useFormContext()` | For `watch()` (checking `dependsOn` field values) and accessing `formState.errors`           |
| `useFieldArray()`  | Core of dynamic arrays. Called with `name: "${stepId}.${section.name}"` (e.g., `"professionalExperience.experiences"`). Returns `{ fields, append, remove }` which power the Add/Delete buttons. |

### How `dependsOn` Works

If a field in config has `dependsOn: "currentlyWorking"`, the step component watches that checkbox value. When the checkbox is checked (`true`), the dependent field (e.g., "End Date") is disabled via the `isDisabled` prop passed to `DynamicField`.

### MUI Components

| Component                              | Usage                                                    |
| -------------------------------------- | -------------------------------------------------------- |
| `Grid` container + items               | Responsive columns. Each field's `gridCols` maps to `sm` breakpoint; `xs` is always 12 (full width on mobile) |
| `Paper` variant="outlined"             | Cards wrapping each repeatable array item                |
| `Button` with `AddCircleOutlineIcon`   | "Add Experience" / "Add Project" button (label from config) |
| `IconButton` with `DeleteOutlineIcon`  | Remove button per array item                             |
| `Typography`                           | Step title, subtitle, item labels                        |
| `Divider`                              | Visual separator between static fields and array sections |

---

## Layer 5: Dynamic Review Step

**File:** `components/registration/dynamic-review-step.tsx`

Reads ALL config steps and ALL form data to render a read-only summary. No hardcoded field references.

### React Hook Form Integration

- `useFormContext()` -> `getValues()` -- Pulls the entire form state as a single object

### How It Works Without Hardcoding

1. Iterates `FORM_STEPS` from config
2. For each step, renders a `Paper` card with a header (icon + title from config)
3. `ReviewFields` iterates `step.fields` and renders `InfoRow` for each non-empty value
4. Fields named `"skills"` or `"technologies"` are split by comma and shown as `Chip` components
5. `ReviewArraySection` iterates each array section's items and shows their sub-field values
6. Checkboxes are rendered as "Yes" / "No" text (from `UI_LABELS.review`)

### MUI Components

`Paper`, `Typography`, `Chip`, `Stack`, `Divider`, `PersonIcon`, `ContactMailIcon`, `WorkIcon`, `FolderIcon`

---

## Layer 6: Main Orchestrator

**File:** `components/registration/registration-form.tsx`

This file ties everything together: form provider, stepper UI, step routing, per-step validation, submission, and form reset.

### React Hook Form -- Central Usage

| RHF API                                | Where / Why                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `useForm<RegistrationFormData>()`      | Creates the form instance with `defaultValues: formDefaultValues`, `resolver: zodResolver(fullSchema)`, `mode: "onTouched"`. The generic type gives full type safety. |
| `FormProvider {...methods}`            | Wraps the entire form tree so all child components can call `useFormContext()` without prop drilling |
| `methods.getValues()`                  | Used in `validateStep()` to grab current data and parse against the step schema               |
| `methods.setError(path, { message })`  | When Zod validation fails, each error is manually set on the correct field path               |
| `methods.clearErrors(path)`            | After successful step validation, clears stale errors from previous attempts                  |
| `methods.reset(formDefaultValues)`     | Called by "Register New Profile" to wipe all data and restart from step 0                     |

### Step Validation Flow (on "Continue" click)

1. `validateStep()` grabs `stepSchemas[activeStep]` (config-derived Zod schema for current step only)
2. Gets the current step's data via `methods.getValues()`
3. Calls `currentSchema.parse(values)` in a try/catch
4. **If passes:** Clears errors and returns `true`
5. **If throws `ZodError`:** Iterates `error.errors[]` and calls `methods.setError()` for each field with the error message from config
6. Only if validation passes does `setActiveStep(prev => prev + 1)` execute

### Submit Flow

1. `handleSubmit()` calls `validateStep()` on the last data step (before review)
2. If valid, calls `submitRegistration(data)` from the mock service
3. On success: stores user ID, shows success screen
4. On error: displays error alert

### "Register New" Flow

1. After successful submit, a `SuccessScreen` shows the user ID and a "Register New Profile" button
2. `handleRegisterNew()` calls `methods.reset(formDefaultValues)` to clear all form state
3. Sets `activeStep` back to `0` (Personal Details)
4. Clears `submitSuccess` and `submitError` state

### MUI Components

| Component                    | Usage                                                                 |
| ---------------------------- | --------------------------------------------------------------------- |
| `ThemeProvider` + `CssBaseline` | Wraps entire app with custom MUI theme                             |
| `Stepper` + `Step` + `StepLabel` | Progress indicator. `alternativeLabel` on desktop, `orientation="vertical"` on mobile (via `useMediaQuery`) |
| `Container` maxWidth="md"    | Centers form content, max 900px wide                                  |
| `Paper` elevation={0}        | Glassmorphism cards with `backdropFilter: blur(20px)`                 |
| `Button`                     | Back, Continue, Submit, Register New -- all labels from `UI_LABELS`   |
| `CircularProgress`           | Shown inside Submit button during async submission                    |
| `Alert` severity="error"     | Displays `submitError` message                                        |
| `Fade`                       | Smooth transition animation between steps                             |
| `CheckCircleIcon`            | Success screen decoration                                             |

---

## Layer 7: Supporting Files

### `lib/mui-theme.ts` -- Custom Theme

Custom `createTheme()` configuration with:

- **Primary color:** #2563EB (blue)
- **Secondary color:** #2DA882 (teal green)
- **Typography:** Inter font family
- **Shape:** 10px border radius
- **Component overrides:**
  - `TextField` -- Custom hover border color, 12px rounded corners
  - `Button` -- No box shadow, gradient on contained variant, 10px radius
  - `StepIcon` -- Blue active, green completed
  - `Chip` -- 8px rounded corners

### `lib/mock-service.ts` -- Simulated Backend

| Function                  | Behavior                                                                 |
| ------------------------- | ------------------------------------------------------------------------ |
| `submitRegistration(data)` | 2-second delay, 95% success rate, returns `{ success, message, userId }` |
| `checkEmailAvailability(email)` | Checks against hardcoded blocked list, returns `{ available, message }` |

Both use `async/await` with `Promise`-based delays. TypeScript ensures return types match what the form expects.

### `app/globals.css` -- Animated Background

- `gradient-shift` keyframe -- Slowly shifts a multi-color gradient (blues, teals, whites) across the background over 20 seconds
- 5 floating orbs -- Positioned absolutely with `float-slow`, `float-medium`, `float-fast` animations at different speeds
- Grid pattern overlay -- Faint dot grid with radial mask fading toward edges
- `.registration-content` -- z-index layering to keep form content above decorations
- Glassmorphism support -- Semi-transparent backgrounds with `backdrop-filter: blur()`

### `app/page.tsx` -- Entry Point

Simply imports and renders `<RegistrationFormWrapper />`. This is a Next.js App Router server component page.

---

## Material UI Components Reference

Complete list of every MUI component used across the project:

### Layout Components

| Component    | File(s)                          | Purpose                           |
| ------------ | -------------------------------- | --------------------------------- |
| `Container`  | registration-form.tsx            | Centers content, max-width 900px  |
| `Grid`       | dynamic-step.tsx                 | Responsive column layout          |
| `Stack`      | dynamic-review-step.tsx, registration-form.tsx | Vertical/horizontal flex stacking |
| `Box`        | registration-form.tsx            | Generic flex container            |
| `Paper`      | dynamic-step.tsx, dynamic-review-step.tsx, registration-form.tsx | Elevated/outlined card surfaces |
| `Divider`    | dynamic-step.tsx, dynamic-review-step.tsx | Visual separators               |

### Input Components

| Component          | File                          | Purpose                               |
| ------------------ | ----------------------------- | ------------------------------------- |
| `TextField`        | dynamic-field-renderer.tsx    | Text, email, tel, date, textarea, select inputs |
| `MenuItem`         | dynamic-field-renderer.tsx    | Dropdown option items inside select   |
| `RadioGroup`       | dynamic-field-renderer.tsx    | Groups radio buttons                  |
| `Radio`            | dynamic-field-renderer.tsx    | Individual radio button               |
| `Checkbox`         | dynamic-field-renderer.tsx    | Boolean toggle                        |
| `FormControl`      | dynamic-field-renderer.tsx    | Wrapper for form elements             |
| `FormControlLabel` | dynamic-field-renderer.tsx    | Labels for radio/checkbox             |
| `FormLabel`        | dynamic-field-renderer.tsx    | Accessible label for radio groups     |
| `FormHelperText`   | dynamic-field-renderer.tsx    | Error messages under radio groups     |
| `InputAdornment`   | dynamic-field-renderer.tsx    | Icon prefixes in text fields          |

### Navigation Components

| Component    | File                    | Purpose                                      |
| ------------ | ----------------------- | -------------------------------------------- |
| `Stepper`    | registration-form.tsx   | Multi-step progress indicator                |
| `Step`       | registration-form.tsx   | Individual step in stepper                   |
| `StepLabel`  | registration-form.tsx   | Label for each step                          |
| `Button`     | dynamic-field-renderer.tsx, dynamic-step.tsx, registration-form.tsx | All actions (navigate, upload, submit, reset) |
| `IconButton` | dynamic-step.tsx        | Delete buttons for array items               |

### Feedback Components

| Component         | File                    | Purpose                              |
| ----------------- | ----------------------- | ------------------------------------ |
| `Alert`           | registration-form.tsx   | Error messages after failed submit   |
| `CircularProgress`| registration-form.tsx   | Loading spinner during submission    |
| `Fade`            | registration-form.tsx   | Smooth step transition animation     |

### Data Display Components

| Component    | File                                         | Purpose                              |
| ------------ | -------------------------------------------- | ------------------------------------ |
| `Typography` | All component files                          | All text rendering                   |
| `Chip`       | dynamic-field-renderer.tsx, dynamic-review-step.tsx | Filename badges, skill/tech tags |
| `Avatar`     | dynamic-field-renderer.tsx                   | Profile photo preview                |

### Utility Components

| Component      | File                    | Purpose                             |
| -------------- | ----------------------- | ----------------------------------- |
| `ThemeProvider` | registration-form.tsx   | Applies custom MUI theme            |
| `CssBaseline`  | registration-form.tsx   | Normalizes CSS across browsers      |

### Icons (from `@mui/icons-material`)

`CloudUploadIcon`, `PersonIcon`, `EmailIcon`, `PhoneIcon`, `LocationOnIcon`, `ArrowBackIcon`, `ArrowForwardIcon`, `SendIcon`, `CheckCircleIcon`, `AddCircleOutlineIcon`, `DeleteOutlineIcon`, `AppRegistrationIcon`, `PersonOutlineIcon`, `ContactMailIcon`, `WorkOutlineIcon`, `FolderOpenIcon`, `CloseIcon`, `RestartAltIcon`

---

## TypeScript Usage and Reasoning

### Where TypeScript Is Used

| Location             | What's Typed                                                          | Why                                                                 |
| -------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `form-config.ts`     | `FieldType`, `ValidationRule`, `FieldConfig`, `ArraySectionConfig`, `StepConfig` interfaces | Creates a strict contract. Adding a field with `type: "dropdown"` (which is not in `FieldType`) throws a compile-time error. |
| `form-schema.ts`     | `z.infer<typeof fullSchema>` => `RegistrationFormData` type           | The form's data shape is automatically derived from the runtime schema. Every `getValues()`, `setError()`, and `reset()` call is type-checked. |
| `dynamic-field-renderer.tsx` | `DynamicFieldProps` interface                                  | Ensures the renderer always receives a valid `FieldConfig` and `fieldPath`. |
| `dynamic-step.tsx`   | `DynamicStepProps` interface                                          | Ensures each step receives a valid `StepConfig`.                    |
| `dynamic-review-step.tsx` | Props typed, `Record<string, unknown>` for dynamic data access   | Safe access to arbitrarily nested form data without `any`.          |
| `registration-form.tsx` | `useForm<RegistrationFormData>()` generic                          | Full autocomplete and type checking on `methods.getValues()`, `methods.setError()`, `methods.watch()`, etc. |
| `mock-service.ts`    | Return types on async functions                                       | The form knows exactly what shape the API response will have.       |
| `mui-theme.ts`       | `createTheme()` with typed palette extensions                         | Theme tokens are type-safe; accessing `theme.palette.primary.main` is validated. |

### Key Benefit

The config interfaces (`FieldConfig`, `StepConfig`) act as a **contract** between:

1. The person editing config (must satisfy the interface)
2. The schema builder (reads config knowing exact shapes)
3. The renderers (trusts config shapes to render correctly)

If any contract is broken, TypeScript catches it before runtime.

---

## React Hook Form Usage and Reasoning

### Why React Hook Form

1. **Performance** -- RHF uses uncontrolled components by default, minimizing re-renders. Only the changed field re-renders, not the entire form.
2. **MUI Integration** -- `Controller` component bridges MUI's controlled inputs with RHF's state management seamlessly.
3. **Nested State** -- RHF natively supports nested objects (`personalDetails.firstName`) and arrays (`professionalExperience.experiences.0.company`) which maps perfectly to our step-based config.
4. **FormProvider/useFormContext** -- Eliminates prop drilling. The form instance is created once at the top and accessed by any child component.
5. **useFieldArray** -- Built-in support for dynamic add/remove of array items with proper state management and re-indexing.

### Where Each RHF API Is Used

| RHF API              | File                          | What It Does                                                       |
| -------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `useForm()`          | registration-form.tsx         | Creates the single form instance with Zod resolver, default values, and `"onTouched"` validation mode |
| `FormProvider`       | registration-form.tsx         | Wraps the entire component tree, making the form instance available everywhere via context |
| `useFormContext()`   | dynamic-field-renderer.tsx, dynamic-step.tsx, dynamic-review-step.tsx | Accesses the form instance without receiving it as a prop |
| `Controller`         | dynamic-field-renderer.tsx    | Wraps each MUI component, connecting its `value` and `onChange` to RHF state |
| `useFieldArray()`    | dynamic-step.tsx              | Manages dynamic arrays (work experiences, projects). Returns `fields`, `append`, `remove` |
| `watch()`            | dynamic-step.tsx              | Observes checkbox values for `dependsOn` conditional field logic    |
| `getValues()`        | registration-form.tsx, dynamic-review-step.tsx | Reads current form data for validation and review display |
| `setError()`         | registration-form.tsx         | Manually sets field errors after Zod validation fails               |
| `clearErrors()`      | registration-form.tsx         | Clears stale errors after successful step validation                |
| `reset()`            | registration-form.tsx         | Wipes all form state when "Register New Profile" is clicked         |
| `zodResolver()`      | registration-form.tsx         | Connects Zod schema to RHF for automatic validation                 |
| `formState.errors`   | dynamic-field-renderer.tsx    | Reads error objects to display error messages under fields           |

### Validation Flow Diagram

```
User clicks "Continue"
        |
        v
validateStep(activeStep)
        |
        v
stepSchemas[activeStep].parse(values)
        |
   +---------+---------+
   |                   |
   v                   v
SUCCESS             ZodError thrown
   |                   |
   v                   v
clearErrors()      iterate error.errors[]
   |                   |
   v                   v
return true        setError(path, { message })
   |                   |
   v                   v
setActiveStep(+1)  Field shows red + error text
```

---

## How to Add / Remove Fields and Steps

### Adding a New Field to an Existing Step

Edit `lib/form-config.ts` only. Example -- adding a "Middle Name" field to Personal Details:

```typescript
// In FORM_STEPS[0].fields, add:
{
  name: "middleName",
  label: "Middle Name",
  type: "text",
  placeholder: "Enter your middle name",
  gridCols: 6,
  validation: { maxLength: 50 },
  errorMessages: { maxLength: "Maximum 50 characters" },
},
```

**That's it.** The schema builder auto-creates the Zod validation, the field renderer auto-renders a `TextField`, and the review step auto-displays the value.

### Removing a Field

Delete the `FieldConfig` object from the step's `fields[]` array. Everything downstream updates automatically.

### Adding a New Step

Add a new `StepConfig` to the `FORM_STEPS` array:

```typescript
{
  id: "education",
  label: "Education",
  title: "Education Background",
  subtitle: "Tell us about your education",
  icon: "school",
  fields: [
    { name: "degree", label: "Degree", type: "text", ... },
    { name: "university", label: "University", type: "text", ... },
  ],
  arraySections: [],
},
```

The stepper, navigation, schema, and review all update automatically.

### Removing a Step

Delete the `StepConfig` from `FORM_STEPS`. The stepper shrinks, navigation adjusts, schema removes those validations, and review skips that section.

---

## Technology Summary Table

| Technology          | Where Used                                                              | Why                                                                                         |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **TypeScript**      | Every `.ts` and `.tsx` file                                             | Interfaces enforce the config contract. `z.infer` derives form types. Component props are strictly typed. Prevents mismatches between config, schema, and components at compile time. |
| **React Hook Form** | registration-form.tsx (useForm, FormProvider, reset), dynamic-field-renderer.tsx (Controller, useFormContext), dynamic-step.tsx (useFieldArray, watch), dynamic-review-step.tsx (getValues) | Manages all form state centrally. Controller bridges MUI. useFieldArray powers dynamic add/remove. FormProvider avoids prop drilling. Per-step validation via setError. Full reset via reset(). |
| **Material UI**     | All component files                                                     | 17+ MUI components provide accessible, responsive, themed inputs, layout, navigation, and feedback. Custom theme ensures visual consistency across all components. |
| **Zod**             | form-schema.ts                                                          | Dynamically generates validation schemas from config. Per-step schemas validate on "Continue". Full schema passed to zodResolver. Error messages come from config. |
| **Config-driven**   | form-config.ts drives everything                                        | Adding/removing a field, step, or option requires editing only this file. Schema builder, field renderer, step renderer, and review all read from it dynamically. Zero duplication. |
| **Next.js**         | app/page.tsx, app/layout.tsx                                            | App Router for routing, server components for initial render, metadata for SEO.             |
| **CSS/Tailwind**    | globals.css                                                             | Animated gradient background, floating orbs, grid pattern, glassmorphism effects.           |
