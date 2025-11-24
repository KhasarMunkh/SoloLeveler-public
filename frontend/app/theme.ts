
// theme.ts
const baseColors = {
    bg: "#0A0E1A",              // main background (dark navy)
    surface: "#131929",         // sheet and pill background (lighter navy)
    primaryText: "#E8EAF6",     // main text (light blue-white)
    secondaryText: "#8B93B8",   // secondary text (muted blue-gray)
    divider: "#1E2538",         // dividers and lines (dark blue-gray)
    accent: "#4A90E2",          // primary accent (bright blue)
    accentHover: "#5BA3F5",     // accent hover state (lighter blue)
    accentMuted: "#2D5F8D",     // muted accent (darker blue)
    success: "#4ECDC4",         // success/completion (teal)
    warning: "#FFB74D",         // warning/alerts (amber)
    danger: "#EF5350",          // danger/delete (red)
    alarm: "#FFB74D",           // alarm color (amber)
    sleep: "#5E6A8A",           // sleep color (slate blue)
    scrim: "rgba(10,14,26,0.7)", // overlay scrim (dark navy with opacity)
};

export const colors = {
    ...baseColors,
    task: baseColors.accent,    // task color uses accent color
};
export const radii = { lg: 28 };
export const fonts = { regular: "Inter_400Regular", medium: "Inter_600SemiBold", bold: "Inter_700Bold" };
export const sizes = { body: 15, title: 22, display: 34 };
