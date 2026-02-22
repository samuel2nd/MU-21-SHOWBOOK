-- MU-21 Showbook Supabase Setup
-- Run this in your Supabase SQL Editor to create the required table

-- Create the shows table
CREATE TABLE IF NOT EXISTS shows (
  name TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index for faster queries
CREATE INDEX IF NOT EXISTS idx_shows_updated_at ON shows(updated_at DESC);

-- Enable Row Level Security (required for Supabase)
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (for anon key)
-- Note: This allows anyone with the URL to read/write shows
-- For production, you may want to add authentication
CREATE POLICY "Allow public read" ON shows FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON shows FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON shows FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON shows FOR DELETE USING (true);

-- Enable real-time for live sync across devices
ALTER PUBLICATION supabase_realtime ADD TABLE shows;

-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON shows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON shows TO authenticated;
