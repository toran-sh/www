import { redirect } from "next/navigation";
import { db } from "@/lib/mongodb";
import { getTrialToken } from "@/lib/tokens";
import { TrialLogsView } from "./trial-logs-view";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function TrialLogsPage({ params }: PageProps) {
  const { subdomain } = await params;

  // Check trial token on server side
  const trialToken = await getTrialToken();

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
