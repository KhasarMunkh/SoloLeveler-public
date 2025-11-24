export type Task = {
    id: string;
    title: string;
    start: string; // ISO
    end: string;   // ISO
    kind?: "task" | "alarm" | "sleep";
    notes?: string;
    repeat?: string;
    alerts?: string[];
    completed?: boolean;
};
