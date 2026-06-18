import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";
import { SITE_DOMAIN } from "@/lib/site";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded 1200×630 social card used for OG + Twitter across the site. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(1100px 560px at 78% 22%, rgba(88,196,220,0.20), transparent 60%), linear-gradient(135deg, #0b1322 0%, #05070d 100%)",
          color: "#f1f4fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 60,
              height: 60,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg,#087EA4,#61DAFB)",
              color: "#06121a",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {"</>"}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_DOMAIN}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            {profile.name}
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, marginTop: 14, color: "#58c4dc" }}>
            {profile.role}
          </div>
          <div style={{ display: "flex", fontSize: 27, marginTop: 20, color: "#c3cad8" }}>
            .NET ecosystem · Cloud · System Design · AI integrations
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: "#8b94a8" }}>
          {profile.fullName} · Bangladesh
        </div>
      </div>
    ),
    { ...size }
  );
}
