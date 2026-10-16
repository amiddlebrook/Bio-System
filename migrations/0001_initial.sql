PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS specimens (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, scientific_name TEXT NOT NULL DEFAULT '',
 kingdom TEXT NOT NULL CHECK (kingdom IN ('Flora','Fauna','Fungi','Microbe','Other')),
 status TEXT NOT NULL CHECK (status IN ('Active','Dormant','Critical')),
 zone TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_specimens_status ON specimens(status);
CREATE TABLE IF NOT EXISTS observations (
 id TEXT PRIMARY KEY,
 specimen_id TEXT NOT NULL REFERENCES specimens(id) ON DELETE CASCADE,
 type TEXT NOT NULL CHECK (type IN ('Temperature','Humidity','pH','Growth','Note')),
 value TEXT NOT NULL DEFAULT '', unit TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '',
 observed_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_specimen ON observations(specimen_id);
