import Link from "next/link";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-3xl font-bold text-sky-600 dark:text-sky-400"
          >
            <img src="/logo.png" alt="toran" className="h-10 w-10" />
            toran
          </Link>
          <Link
            href="/try"
            className="bg-sky-600 dark:bg-sky-500 px-4 py-2 text-sm text-white dark:text-zinc-950 hover:bg-sky-700 dark:hover:bg-sky-400"
          >
            Create a toran
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-zinc-500">
            Last updated: January 2025
          </p>

          <div className="mt-12 space-y-8 text-zinc-600 dark:text-zinc-400">
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By accessing or using toran (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                2. Description of Service
              </h2>
              <p className="mt-3">
                toran is a read-only outbound API inspection service. It allows you to observe HTTP requests sent from your software to third-party APIs by routing them through toran&apos;s proxy infrastructure.
              </p>
              <p className="mt-3">
                toran does not retry, cache, block, or modify requests or responses. It does not inspect prompts, model internals, or agent reasoning. Logging of payload bodies and other sensitive fields is disabled by default and only enabled when you explicitly turn it on.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                3. Use of the Service
              </h2>
              <div className="mt-3 space-y-3">
                <p>You agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service only for lawful purposes</li>
                  <li>Not use the Service to intercept, monitor, or inspect traffic you are not authorized to access</li>
                  <li>Not use the Service to transmit malicious content or conduct attacks</li>
                  <li>Not attempt to circumvent usage limits or abuse the Service</li>
                  <li>Not resell or redistribute access to the Service without authorization</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                4. Data and Privacy
              </h2>
              <p className="mt-3">
                Traffic routed through toran may be logged for inspection purposes. By using the Service, you acknowledge that request metadata, headers, and other information may be stored temporarily as described in our <Link href="/privacy" className="text-sky-600 dark:text-sky-400 hover:underline">Privacy Policy</Link>. By default, payload bodies are not logged and sensitive fields are redacted unless you explicitly enable additional logging.
              </p>
              <p className="mt-3">
                You are responsible for ensuring you have the right to route traffic through toran and that doing so complies with applicable laws and any agreements with third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                4A. Saved Response Replay
              </h2>
              <p className="mt-3">
                Saved response replay lets you replay a captured request using a saved response snapshot. No upstream API call is made during replay, and live traffic is never affected.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                5. Service Availability
              </h2>
              <p className="mt-3">
                toran is provided &quot;as is&quot; without guarantees of uptime or availability. We may modify, suspend, or discontinue the Service at any time. We are not liable for any loss resulting from Service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                6. Usage Limits
              </h2>
              <p className="mt-3">
                The Service includes usage and retention limits that vary by plan tier. Exceeding these limits may result in temporary throttling or reduced functionality. We reserve the right to modify limits with reasonable notice.
              </p>
              <p className="mt-3">
                Certain features and configuration options, including customization of sensitive logging fields, are only available on authenticated plans.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                7. Payment and Billing
              </h2>
              <p className="mt-3">
                Paid plans are billed monthly in advance. You may cancel at any time, and your access will continue until the end of the billing period. Refunds are not provided for partial months.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                8. Limitation of Liability
              </h2>
              <p className="mt-3">
                To the maximum extent permitted by law, toran and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
              </p>
              <p className="mt-3">
                The Service is a debugging and inspection tool. It is not intended as production infrastructure and should not be relied upon for critical operations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                8A. What We Don&apos;t Do
              </h2>
              <div className="mt-3 space-y-3">
                <p>To be clear, toran does not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sell your traffic logs or use them for advertising</li>
                  <li>Use your traffic logs to train models</li>
                  <li>Make decisions on your behalf (no alerts, retries, blocking, caching, or policy enforcement)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                9. Termination
              </h2>
              <p className="mt-3">
                We may terminate or suspend your access to the Service at any time for violation of these terms or for any other reason at our discretion. Upon termination, your right to use the Service ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                10. Changes to Terms
              </h2>
              <p className="mt-3">
                We may update these Terms of Service from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                11. Contact
              </h2>
              <p className="mt-3">
                For questions about these terms, contact us at support@toran.sh. Privacy questions should be directed to the Privacy Policy and support@toran.sh.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer className="mt-32" />
    </div>
  );
}
