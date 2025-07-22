-- Create shops table (simplified version)
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stance TEXT,
  appearance TEXT NOT NULL,
  commercial_text TEXT,
  homepage_url TEXT,
  hours_start TEXT,
  hours_end TEXT,
  recruit TEXT,
  phone TEXT,
  address TEXT,
  catchphrase TEXT,
  prompt TEXT,
  position_row INTEGER DEFAULT 0,
  position_side TEXT DEFAULT 'left' CHECK (position_side IN ('left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop_chats table for chat history
CREATE TABLE IF NOT EXISTS shop_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  community_name TEXT,
  prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default facilities
INSERT INTO facilities (name, icon, is_visible, community_name) VALUES
  ('長野市役所', '🏛️', true, '長野市'),
  ('図書館', '📚', true, '長野市'),
  ('病院', '🏥', true, '長野市'),
  ('郵便局', '📮', true, '長野市'),
  ('警察署', '👮', true, '長野市'),
  ('消防署', '🚒', true, '長野市'),
  ('学校', '🏫', true, '長野市'),
  ('公園', '🌳', true, '長野市')
ON CONFLICT DO NOTHING; 