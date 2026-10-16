ALTER TABLE specimens ADD COLUMN workspace_id TEXT NOT NULL DEFAULT '';
ALTER TABLE observations ADD COLUMN workspace_id TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_specimens_workspace ON specimens(workspace_id,created_at);
CREATE INDEX IF NOT EXISTS idx_observations_workspace ON observations(workspace_id,observed_at);
