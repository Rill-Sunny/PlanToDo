CREATE TYPE todo_status AS ENUM ('pending', 'completed', 'archived');
CREATE TYPE goal_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE priority_level AS ENUM ('important_urgent', 'important_not_urgent', 'not_important_urgent', 'not_important_not_urgent');

CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  priority priority_level NOT NULL,
  status todo_status NOT NULL DEFAULT 'pending',
  goal_id UUID REFERENCES goals(id),
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  target_minutes INTEGER NOT NULL,
  current_minutes INTEGER DEFAULT 0,
  status goal_status NOT NULL DEFAULT 'active',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE goal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) NOT NULL,
  minutes INTEGER NOT NULL,
  source VARCHAR(20) NOT NULL CHECK (source IN ('manual', 'todo')),
  todo_id UUID REFERENCES todos(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  note_date DATE NOT NULL,
  title VARCHAR(255),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE note_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) NOT NULL,
  image_url TEXT NOT NULL
);

CREATE TABLE memorial_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('Birthday', 'Anniversary', 'Exam', 'Travel', 'Custom')),
  is_lunar BOOLEAN DEFAULT false,
  cover_image TEXT,
  reminder_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE memorial_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES memorial_events(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  record_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_goal_logs_goal_id ON goal_logs(goal_id);
CREATE INDEX idx_notes_date ON notes(note_date);

CREATE POLICY "Users can only access their own todos" ON todos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own goals" ON goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own goal_logs" ON goal_logs
  FOR ALL USING (auth.uid() = (SELECT user_id FROM goals WHERE id = goal_id));

CREATE POLICY "Users can only access their own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own note_images" ON note_images
  FOR ALL USING (auth.uid() = (SELECT user_id FROM notes WHERE id = note_id));

CREATE POLICY "Users can only access their own memorial_events" ON memorial_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own memorial_records" ON memorial_records
  FOR ALL USING (auth.uid() = (SELECT user_id FROM memorial_events WHERE id = event_id));