-- Migration: Add unique constraint to nama_mitra and automatic updated_at
-- This ensures that no two mitra have the same name at the database level
-- and that timestamps are correctly maintained.

-- 1. Ensure uniqueness
ALTER TABLE public.mitra ADD CONSTRAINT mitra_nama_mitra_key UNIQUE (nama_mitra);

-- 2. Add trigger for updated_at (standard procedure)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mitra_updated_at ON public.mitra;
CREATE TRIGGER trg_mitra_updated_at
BEFORE UPDATE ON public.mitra
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
