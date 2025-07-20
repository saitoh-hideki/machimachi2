-- 複数の休日を保存できるようにholidayカラムを変更
-- 既存のholidayカラムを削除して、新しいholidaysカラムを追加

-- 既存のholidayカラムを削除
ALTER TABLE shops DROP COLUMN IF EXISTS holiday;

-- 新しいholidaysカラムを追加（JSONB型で複数の日付を保存）
ALTER TABLE shops ADD COLUMN holidays JSONB DEFAULT '[]'::jsonb;

-- コメントを追加
COMMENT ON COLUMN shops.holidays IS '店舗の休日リスト（YYYY-MM-DD形式の日付配列）'; 