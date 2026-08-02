-- A regular PostgreSQL btree index cannot safely index long normalized entry text.
-- V1 keeps ILIKE search functional without this ineffective index; a trigram or
-- full-text index can be introduced later when search requirements are approved.
DROP INDEX IF EXISTS "cultural_entries_normalized_search_text_idx";
