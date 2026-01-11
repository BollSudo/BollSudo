import fs from "fs/promises";
import fetch from "node-fetch";

const RANGE = "last_year"
const AVAILABLE_RANGES = [
    "all_time",
    "last_year",
    "last_6_months",
    "last_30_days",
    "last_7_days",
]
const SAVE_DIR = "data/wakatime/"
const FILE_NAME = "langs"

if (!AVAILABLE_RANGES.includes(RANGE)) {
    console.error("Invalid Range : " + RANGE);
    process.exit(1);
}

const auth = Buffer.from(process.env.WAKATIME_API_KEY + ":").toString("base64");
const res = await fetch(
    `https://wakatime.com/api/v1/users/current/stats/${RANGE}`,
    {
        headers: {
            Authorization: `Basic ${auth}`,
        },
    }
);

const json = await res.json();
if (!res.ok || json.error) {
    console.error("WakaTime API error:", json);
    process.exit(1);
}

// FILTER DATA
const languages = (json.data.languages || [])
    .map(l => ({
        name: l.name,
        total_seconds: Math.round(l.total_seconds),
        percent: Math.round(l.percent * 10) / 10
    }))
    .sort((a, b) => b.total_seconds - a.total_seconds);

const today = new Date();
const output = {
    "generated_at": today.toISOString(),
    "range": RANGE,
    languages,
}

try {
    await fs.mkdir(SAVE_DIR, { recursive: true });
    const path = SAVE_DIR + FILE_NAME + ".json"
    await fs.writeFile(path, JSON.stringify(output, null, 2));
    console.log(`Saved ${path}`);
} catch (e) {
    console.error("Failed to write file:", e);
}