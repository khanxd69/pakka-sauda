-- Pakka Sauda: storage bucket for evidence photos (P1). Owner: Workstream A. Run once in the Supabase SQL editor.
-- Public bucket: anyone with the URL can view a photo. Acceptable for a demo; say so if asked.
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;
