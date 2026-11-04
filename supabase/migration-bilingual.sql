-- Run once in Supabase > SQL Editor. Safe to run again.
alter table questions add column if not exists label_ar text not null default '';
alter table questions add column if not exists options_ar jsonb not null default '[]'::jsonb;

update questions set label_ar = 'من اهتم بك اليوم؟' where label_ar = '' and label = 'Who looked after you today?';
update questions set label_ar = 'ما مدى احتمال أن توصي بنا لأصدقائك؟' where label_ar = '' and label ilike '%recommend%';
update questions set label_ar = 'ما الذي يمكننا تحسينه؟' where label_ar = '' and label = 'What could we do better?';
update questions set label_ar = 'هل يمكننا التواصل معك؟' where label_ar = '' and label ilike '%contact%';
update questions set label_ar = 'اسمك' where label_ar = '' and label = 'Your name';
update questions set label_ar = 'رقم الموبايل' where label_ar = '' and label ilike '%mobile%';
