-- Run once in Supabase > SQL Editor.
-- Replaces the survey questions with the Customer Satisfaction Survey questions.
-- Old questions are hidden (not deleted), so answers already collected keep their labels.

update questions set active = false;

insert into questions (label, label_ar, type, options, options_ar, required, active, sort_order)
select v.label, v.label_ar, v.type, v.options::jsonb, v.options_ar::jsonb, true, true,
       (select coalesce(max(sort_order), 0) from questions) + v.n
from (values
  (1, 'Customer Name', 'اسم العميل', 'name', '[]', '[]'),
  (2, 'Register Mobile Number', 'رقم الموبايل المسجل', 'phone', '[]', '[]'),
  (3, 'Project Name', 'اسم المشروع', 'choice',
      '["Blue Tree","Blue Walk","Residence Eight","Capital Avenue","Vallis"]',
      '["Blue Tree","Blue Walk","Residence Eight","Capital Avenue","Vallis"]'),
  (4, 'Was your service request resolved successfully?', 'هل تم حل طلب الخدمة بنجاح؟', 'choice',
      '["Yes","Partially","No"]',
      '["نعم","جزئياً","لا"]')
) as v(n, label, label_ar, type, options, options_ar);

-- Question 5 is the star rating shown first.
insert into settings (key, value) values
  ('ui_askVisit', 'How satisfied are you with the service provided?'),
  ('ui_askVisit_ar', 'ما مدى رضاك عن الخدمة المقدمة؟'),
  ('ui_askVisitStaff', 'How satisfied are you with the service provided?'),
  ('ui_askVisitStaff_ar', 'ما مدى رضاك عن الخدمة المقدمة؟'),
  ('ui_rating_1', 'Very dissatisfied'),
  ('ui_rating_1_ar', 'غير راضي على الإطلاق'),
  ('ui_rating_2', 'Somewhat dissatisfied'),
  ('ui_rating_2_ar', 'غير راضي إلى حد ما'),
  ('ui_rating_3', 'Neither satisfied nor dissatisfied'),
  ('ui_rating_3_ar', 'لا راضي ولا غير راضي'),
  ('ui_rating_4', 'Somewhat satisfied'),
  ('ui_rating_4_ar', 'راضي إلى حد ما'),
  ('ui_rating_5', 'Very satisfied'),
  ('ui_rating_5_ar', 'راضي جداً')
on conflict (key) do update set value = excluded.value;
