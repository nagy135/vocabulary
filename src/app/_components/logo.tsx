"use client";

import { useTheme } from "next-themes";

export default function Logo() {
  const { theme } = useTheme();
  return (
    <svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 57.09 45.74"
      style={{
        marginTop: 50,
        width: "150px",
        height: "150px",
      }}
      // onMouseMove={(e) => console.log(e.movementX, e.movementY)}
    >
      <title>v</title>
      <path
        d="M0.51,0H16.83a0.51,0.51,0,0,1,.25.06,0.5,0.5,0,0,1,.18.17h0L37.13,32a0.49,0.49,0,0,1,0,.54h0L29,45.51h0a0.5,0.5,0,0,1-.18.17,0.51,0.51,0,0,1-.49,0,0.5,0.5,0,0,1-.18-0.17h0L0.08,0.77A0.5,0.5,0,0,1,0,.52H0A0.5,0.5,0,0,1,.06.26,0.5,0.5,0,0,1,.25.07h0A0.5,0.5,0,0,1,.51,0h0ZM34.72,0H56.58a0.5,0.5,0,0,1,.26.07h0A0.5,0.5,0,0,1,57,.26a0.51,0.51,0,0,1,.06.26h0A0.5,0.5,0,0,1,57,.77L46.08,18.21h0a0.5,0.5,0,0,1-.18.17,0.51,0.51,0,0,1-.49,0,0.5,0.5,0,0,1-.18-0.17h0L34.3,0.77A0.5,0.5,0,0,1,34.22.52h0A0.5,0.5,0,0,1,34.28.26,0.5,0.5,0,0,1,34.47.07h0A0.5,0.5,0,0,1,34.72,0h0Z"
        style={{
          fill: theme === "dark" ? "#fff" : "#0b0b0b",
          fillRule: "evenodd",
        }}
      />
    </svg>
  );
}
