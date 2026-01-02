import { redirect } from "next/navigation";
import { db } from "@/lib/mongodb";
import { getTrialToken, getSession } from "@/lib/tokens";
import { TrialLogsView } from "./trial-logs-view";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function TrialLogsPage({ params }: PageProps) {
  const { subdomain } = await params;

  // Check if user is logged in
  const userId = await getSession();
  const trialToken = await getTrialToken();

  // If user is logged in, redirect to API route that handles auto-linking
  // (API routes can modify cookies, Server Components cannot)
  if (userId) {
    redirect(`/api/trial/auto-link?subdomain=${subdomain}`);
  }

  // Not logged in - check trial token
  if (!trialToken) {
    redirect("/try");
  }

  // Verify the toran belongs to this trial session
  const gateway = await db.collection("gateways").findOne({
    subdomain,
    trial_token: trialToken,
  });

  if (!gateway) {
    redirect("/try");
  }

  return <TrialLogsView subdomain={subdomain} />;
}
