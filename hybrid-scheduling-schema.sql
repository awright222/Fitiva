-- Hybrid Scheduling Schema Updates
-- Adds session_mode and video_link fields to support in-person, virtual, and self-guided sessions

-- Add session_mode enum type
CREATE TYPE session_mode AS ENUM ('in_person', 'virtual', 'self_guided');

-- Add new fields to sessions table
ALTER TABLE sessions 
ADD COLUMN session_mode session_mode DEFAULT 'in_person' NOT NULL,
ADD COLUMN video_link VARCHAR(500),
ADD COLUMN program_id INTEGER REFERENCES programs(id);

-- Add comments for documentation
COMMENT ON COLUMN sessions.session_mode IS 'Type of session delivery: in_person, virtual, or self_guided';
COMMENT ON COLUMN sessions.video_link IS 'Video conferencing link for virtual sessions (Zoom, Teams, etc.)';
COMMENT ON COLUMN sessions.program_id IS 'Program assigned for self-guided sessions';

-- Update RLS policies to include new fields
-- (Existing RLS policies will automatically apply to new columns)

-- Create index for performance on session_mode queries
CREATE INDEX idx_sessions_mode ON sessions(session_mode);
CREATE INDEX idx_sessions_trainer_mode ON sessions(trainer_id, session_mode);
CREATE INDEX idx_sessions_client_mode ON sessions(client_id, session_mode);

-- Ensure backward compatibility: existing sessions default to 'in_person'
-- (This is handled by the DEFAULT clause above)