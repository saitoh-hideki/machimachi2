-- Create shop_documents table for uploaded text files
CREATE TABLE IF NOT EXISTS shop_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  content TEXT NOT NULL,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shop_documents_shop_id ON shop_documents(shop_id); 