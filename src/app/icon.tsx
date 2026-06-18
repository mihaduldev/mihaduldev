import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/** Raster favicon (PNG) — Google's SERP favicon fetcher and legacy surfaces
 *  prefer .ico/.png over SVG, so this complements public/favicon.svg. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 11,
          background: "linear-gradient(135deg,#087EA4,#61DAFB)",
          color: "#06121a",
          fontSize: 23,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        {"</>"}
      </div>
    ),
    { ...size }
  );
}
