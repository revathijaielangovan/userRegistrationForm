# Multi-Step User Registration Form

A modern, responsive multi-step registration form built with **Next.js**, **TypeScript**, **React Hook Form**, and **Material UI**.

## 🌟 Features

- ✅ **Multi-step form** with 4 sections: Personal Details, Contact Details, Professional Experience, and Projects
- ✅ **Dynamic field rendering** from a single configuration file
- ✅ **Comprehensive validation** using Zod schemas
- ✅ **Material UI components**: TextField, Select, Radio, Checkbox, File Upload
- ✅ **Fully responsive** design (Desktop, Tablet, Mobile)
- ✅ **Professional light theme** with subtle animations
- ✅ **Mock backend service** for testing
- ✅ **Type-safe** with TypeScript

## 🚀 Live Demo

**Deployed on Vercel**: [View Live Demo](https://multi-step-registration-form-1.vercel.app)

## 📦 Tech Stack

- **Framework**: Next.js 16.1.6
- **Language**: TypeScript
- **Form Management**: React Hook Form
- **Validation**: Zod
- **UI Library**: Material UI (MUI)
- **Styling**: CSS + Tailwind CSS

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/revathijaielangovan/userRegistrationForm.git
   cd userRegistrationForm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and animations
│   └── page.tsx           # Main page
├── components/
│   └── registration/      # Form components
│       ├── registration-form.tsx
│       ├── dynamic-field-renderer.tsx
│       └── step-renderer.tsx
├── lib/
│   ├── form-config.ts     # Single source of truth for form fields
│   ├── form-schema.ts     # Zod validation schemas
│   ├── mui-theme.ts       # Material UI theme configuration
│   └── mock-service.ts    # Mock backend API
└── README.md
```

## ⚙️ Configuration

All form fields, steps, and validation rules are defined in **`lib/form-config.ts`**. This file is the single source of truth for the entire form.

### Adding a New Field

```typescript
{
  name: "fieldName",
  label: "Field Label",
  type: "text",
  placeholder: "Enter value...",
  required: true,
  gridCols: 6,
  validation: { required: true, minLength: 2 },
  errorMessages: {
    required: "This field is required",
    minLength: "Minimum 2 characters required"
  }
}
```

## 🎨 Customization

### Theme
Edit `lib/mui-theme.ts` to customize colors, typography, and component styles.

### Background
Edit `app/globals.css` to modify the animated background gradient and orbs.

## 🧪 Validation

The form uses **Zod** for schema validation. Schemas are automatically generated from the configuration in `lib/form-schema.ts`.

Supported validations:
- Required fields
- Min/Max length
- Email format
- URL format
- Custom regex patterns

## 📱 Responsive Design

The form is fully responsive with breakpoints for:
- **Desktop**: 12-column grid
- **Tablet**: 6-column grid
- **Mobile**: Full-width fields

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Deploy with Vercel CLI**
   ```bash
   npx vercel --prod
   ```

Or connect your GitHub repository to Vercel for automatic deployments.

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Revathi Jaielangovan**
- GitHub: [@revathijaielangovan](https://github.com/revathijaielangovan)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ using Next.js and Material UI
