export const PX_PER_MIN = 1.2; // ~72px/hour

export const clamp = (n: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, n));

export const minutesBetween = (a: Date, b: Date) =>
    Math.round((b.getTime() - a.getTime()) / 60000);

export const ceilToHour = (d: Date) => {
    const x = new Date(d);
    x.setMinutes(0, 0, 0);
    if (d.getMinutes() || d.getSeconds() || d.getMilliseconds()) x.setHours(x.getHours() + 1);
    return x;
};

export const floorToHour = (d: Date) => {
    const x = new Date(d);
    x.setMinutes(0, 0, 0);
    return x;
};

export const fmtHour = (d: Date) => {
    let h = d.getHours();
    const am = h < 12;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}${am ? "AM" : "PM"}`;
};
