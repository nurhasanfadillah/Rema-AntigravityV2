-- Migration: Add unique constraint to nama_mitra
-- This ensures that no two mitra have the same name at the database level.

ALTER TABLE public.mitra ADD CONSTRAINT mitra_nama_mitra_key UNIQUE (nama_mitra);
