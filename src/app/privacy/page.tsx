import Link from "next/link";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-zinc-500">
            Last updated: January 2025
          </p>

          <div className="mt-12 space-y-8 text-zinc-600 dark:text-zinc-400">
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Overview
              </h2>
              <p className="mt-3">
                toran is designed with privacy in mind. We collect the minimum data necessary to provide the Service and give you visibility into your API traffic.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                What We Collect
              </h2>
              <div className="mt-3 space-y-4">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Account Information</h3>
                  <p className="mt-1">
                    When you sign in, we collect your email address. This is used for authentication and account-related communications.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Traffic Logs</h3>
                  <p className="mt-1">
                    When you route traffic through toran, we log:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Request method, path, and query parameters</li>
                    <li>Request and response headers</li>
                    <li>Response status code</li>
                    <li>Request timing and duration</li>
                    <li>Request and response body sizes</li>
                  </ul>
                  <p className="mt-2">
                    By default, sensitive headers (Authorization, Cookie, API keys) and query parameter values are redacted. Request and response bodies are not logged unless you explicitly enable body logging in your toran settings.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Usage Data</h3>
                  <p className="mt-1">
                    We collect basic usage metrics to operate and improve the Service, including request counts and feature usage patterns.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Data Retention
              </h2>
              <div className="mt-3 space-y-3">
                <p>
                  Traffic logs are retained on a rolling basis according to your plan tier:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Anonymous (no account): Latest 1,000 logs per toran</li>
                  <li>Free: Latest 2,500 logs per toran</li>
                  <li>Pro: Latest 25,000 logs per toran</li>
                  <li>Pro Plus: Latest 250,000 logs per toran</li>
                </ul>
                <p>
                  Older logs are automatically deleted as new logs arrive. Unclaimed trial torans may be deleted after a period of inactivity.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                How We Use Your Data
              </h2>
              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>To provide and operate the Service</li>
                <li>To display your traffic logs in the dashboard</li>
                <li>To send account-related emails (magic links, claim emails)</li>
                <li>To improve and develop the Service</li>
                <li>To enforce our Terms of Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Data Sharing
              </h2>
              <p className="mt-3">
                We do not sell your data. We may share data with:
              </p>
              <ul className="mt-3 list-disc pl-6 space-y-2">
                <li>Service providers who help operate toran (hosting, email delivery)</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Security
              </h2>
              <p className="mt-3">
                We use industry-standard security measures to protect your data, including encryption in transit (HTTPS) and secure infrastructure. However, no system is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Your Rights
              </h2>
              <p className="mt-3">
                You can delete your torans and associated logs at any time through the dashboard. To delete your account entirely, contact us at support@toran.sh.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Cookies
              </h2>
              <p className="mt-3">
                We use cookies for authentication (session tokens) and basic functionality. We do not use tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Third-Party Services
              </h2>
              <p className="mt-3">
                toran proxies requests to upstream APIs you configure. The data you send through toran is transmitted to those third-party services according to their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Changes to This Policy
              </h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page with an updated date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                Contact
              </h2>
              <p className="mt-3">
                For questions about this Privacy Policy, contact us at support@toran.sh.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer className="mt-32" />
    </div>
  );
}
