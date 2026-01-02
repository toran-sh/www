import { redirect } from "next/navigation";
import { db } from "@/lib/mongodb";
import { getTrialToken, getSession, clearTrialToken } from "@/lib/tokens";
import { TrialLogsView } from "./trial-logs-view";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function TrialLogsPage({ params }: PageProps) {
  const { subdomain } = await params;

  // Check if user is logged in
  const userId = await getSession();
  const trialToken = await getTrialToken();

  // If user is logged in
  if (userId) {
    // If they have a trial token, auto-link all trial torans
    if (trialToken) {
      await db.collection("gateways").updateMany(
        { trial_token: trialToken },
        {
          $set: {
            user_id: userId,
            trial_token: null,
            updatedAt: new Date(),
          },
        }
      );

      // Clear the trial token cookie
      await clearTrialToken();
    }

    // Check if this toran belongs to the user (either just linked or already owned)
    const userGateway = await db.collection("gateways").findOne({
      subdomain,
      user_id: userId,
    });

    if (userGateway) {
      // Redirect to the authenticated toran page
      redirect(`/toran/${subdomain}`);
    }

    // Toran doesn't belong to user, redirect to dashboard
    redirect("/dashboard");
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
