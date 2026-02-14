import type { RegistrationFormData } from "./form-schema";

// Simulates network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function submitRegistration(
  data: RegistrationFormData
): Promise<{ success: boolean; message: string; userId?: string }> {
  await delay(2000);

  // Simulate a 95% success rate
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    const userId = `USR-${Date.now().toString(36).toUpperCase()}`;
    console.log("[Mock API] Registration submitted successfully:", {
      userId,
      data,
    });

    return {
      success: true,
      message: "Registration completed successfully!",
      userId,
    };
  }

  return {
    success: false,
    message: "Server error. Please try again later.",
  };
}

export async function checkEmailAvailability(
  email: string
): Promise<{ available: boolean }> {
  await delay(800);
  const takenEmails = [
    "test@example.com",
    "admin@example.com",
    "user@demo.com",
  ];
  return { available: !takenEmails.includes(email.toLowerCase()) };
}
