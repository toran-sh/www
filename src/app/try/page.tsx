import { redirect } from "next/navigation";
import { getSession } from "@/lib/tokens";
import { CreateTrialForm } from "./create-trial-form";

export default async function TryPage() {
  // Redirect logged-in users to dashboard
  const userId = await getSession();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Try toran
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            No signup required. Create a toran and start proxying requests instantly.
          </p>
        </div>

        <CreateTrialForm />

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-cyan-600 dark:text-cyan-400 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
