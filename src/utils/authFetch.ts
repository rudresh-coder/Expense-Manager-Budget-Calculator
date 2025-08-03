// src/utils/authFetch.ts
export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.status === 401) {
    // Clear sensitive data
    localStorage.removeItem("token");
    localStorage.removeItem("isPremium");
    localStorage.removeItem("trialExpiresAt");
    localStorage.removeItem("expenseManagerActiveAccountId");

    // Redirect to login (works in most browsers)
    window.location.href = "/signin";
    // Optionally, you can show a message or use a toast here

    // Return a rejected promise to stop further processing
    throw new Error("Session expired. Please log in again.");
  }

  return res;
}