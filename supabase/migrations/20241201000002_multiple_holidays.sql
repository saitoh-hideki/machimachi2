-- 複数の休日を保存できるようにholidaysカラムを作成
-- 既存のholidayカラムを削除して、新しいholidaysカラムを追加

-- 既存のholidayカラムを削除（存在する場合）
ALTER TABLE shops DROP COLUMN IF EXISTS holiday;

-- 新しいholidaysカラムを追加（JSONB型で複数の日付を保存）
ALTER TABLE shops ADD COLUMN holidays JSONB DEFAULT '[]'::jsonb;

-- コメントを追加
COMMENT ON COLUMN shops.holidays IS '店舗の休日リスト（YYYY-MM-DD形式の日付配列）';

-- インデックスを追加（検索パフォーマンス向上）
CREATE INDEX idx_shops_holidays ON shops USING GIN (holidays);

-- 例: 特定の日付が休日かどうかをチェックする関数
CREATE OR REPLACE FUNCTION is_shop_holiday(shop_holidays JSONB, check_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN shop_holidays ? check_date::text;
END;
$$ LANGUAGE plpgsql IMMUTABLE; 