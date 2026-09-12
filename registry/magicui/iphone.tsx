import { SVGProps } from "react";

export interface IphoneProps extends SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  /** Image URL shown inside the screen (e.g. "/screens/home.png"). */
  src?: string;
  /** Video URL shown inside the screen. Takes priority over `src`. */
  videoSrc?: string;
}

/**
 * iPhone 15 Pro mockup frame (magic-ui style).
 * Renders an SVG titanium frame with a clipped screen area.
 * Pass `src` to drop a screenshot into the screen, or `videoSrc` for a video.
 */
export function Iphone({
  width = 433,
  height = 882,
  src,
  videoSrc,
  ...props
}: IphoneProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 433 882"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Side buttons */}
      <rect x="0" y="206" width="4" height="40" rx="2" fill="#2A2A2C" />
      <rect x="0" y="272" width="4" height="72" rx="2" fill="#2A2A2C" />
      <rect x="0" y="356" width="4" height="72" rx="2" fill="#2A2A2C" />
      <rect x="429" y="296" width="4" height="100" rx="2" fill="#2A2A2C" />

      {/* Titanium body */}
      <rect
        x="4"
        y="2"
        width="425"
        height="878"
        rx="68"
        fill="#2A2A2C"
      />
      {/* Outer highlight */}
      <rect
        x="4.5"
        y="2.5"
        width="424"
        height="877"
        rx="67.5"
        stroke="#48484A"
        strokeWidth="1"
      />
      {/* Black bezel */}
      <rect
        x="11"
        y="9"
        width="411"
        height="864"
        rx="61"
        fill="#050505"
      />

      {/* Screen background (fallback) */}
      <rect
        x="20"
        y="18"
        width="393"
        height="846"
        rx="54"
        fill="#FBFBFD"
      />

      {/* Screenshot / video */}
      {videoSrc ? (
        <foreignObject
          x="20"
          y="18"
          width="393"
          height="846"
          clipPath="url(#iphone-screen-clip)"
        >
          <video
            // @ts-expect-error - foreignObject html
            xmlns="http://www.w3.org/1999/xhtml"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            autoPlay
            loop
            muted
            playsInline
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </foreignObject>
      ) : src ? (
        <image
          href={src}
          x="20"
          y="18"
          width="393"
          height="846"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#iphone-screen-clip)"
        />
      ) : null}

      {/* No Dynamic Island here — the app screenshots already include their own
          (status bar + island baked into the PNG). Drawing a second one over the
          top left the two slightly misaligned. */}

      <defs>
        <clipPath id="iphone-screen-clip">
          <rect x="20" y="18" width="393" height="846" rx="54" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default Iphone;
