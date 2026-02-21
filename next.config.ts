import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // Required for Firebase Auth popups to communicate with the opener window.
          // "same-origin-allow-popups" allows cross-origin popups (Google OAuth)
          // while still protecting against Spectre/XS-Leaks from other navigations.
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Deny iframe embedding from other origins
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Enable basic XSS protection in older browsers
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Don't leak the referrer URL to third-party domains
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
