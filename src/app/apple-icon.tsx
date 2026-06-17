import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — the brand mark on the gradient tile (iOS rounds it). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#087EA4,#61DAFB)",
          color: "#06121a",
          fontSize: 92,
          fontWeight: 800,
        }}
      >
        {"</>"}
      </div>
    ),
    { ...size }
  );
}
