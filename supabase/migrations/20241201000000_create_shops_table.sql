-- Create shops table (updated to match TypeScript interface)
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stance TEXT,
  appearance TEXT NOT NULL,
  icon TEXT,
  commercial_text TEXT,
  homepage_url TEXT,
  hours_start TEXT,
  hours_end TEXT,
  recruit TEXT,
  phone TEXT,
  address TEXT,
  vision_enabled BOOLEAN DEFAULT false,
  holidays TEXT[] DEFAULT '{}',
  position JSONB DEFAULT '{}',
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
  category TEXT,
  stance TEXT,
  philosophy TEXT,
  response_stance TEXT,
  is_visible BOOLEAN DEFAULT true,
  commercial_text TEXT,
  vision_enabled BOOLEAN DEFAULT false,
  address TEXT,
  phone TEXT,
  homepage_url TEXT,
  hours_start TEXT,
  hours_end TEXT,
  recruit TEXT,
  holidays TEXT[] DEFAULT '{}',
  community_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default facilities
INSERT INTO facilities (name, icon, category, is_visible, community_name) VALUES
  ('長野市役所', '🏛️', 'Government', true, '長野市'),
  ('図書館', '📚', 'Library', true, '長野市'),
  ('病院', '🏥', 'Hospital', true, '長野市'),
  ('郵便局', '📮', 'Post Office', true, '長野市'),
  ('警察署', '👮', 'Police', true, '長野市'),
  ('消防署', '🚒', 'Fire Station', true, '長野市'),
  ('学校', '🏫', 'School', true, '長野市'),
  ('公園', '🌳', 'Park', true, '長野市')
ON CONFLICT DO NOTHING; 