-- ============================================================================
-- DEMO / SEED DATA — clearly placeholder. Replace via /admin/settings and the
-- respective admin screens before going live. No real people are represented.
-- ============================================================================

update site_settings set
  company_name = '[Company Name] Company',
  company_motto = 'One Fold, One Shepherd',
  company_description = 'The Royal Shepherds [Company Name] Company exists to raise Christ-centered young people through faith, leadership, discipline, service and fellowship. (Demo description — replace with your company''s real description.)',
  address = '[Church Address, City]',
  phone = '+234 000 000 0000',
  email = 'info@example.org',
  whatsapp = '+234 000 000 0000',
  homepage = '{
    "hero_title": "Welcome to The Royal Shepherds, [Company Name]",
    "hero_subtitle": "Building Christ-centered young people through faith, leadership, discipline, service and fellowship.",
    "cta_primary": "Become a Member",
    "cta_secondary": "Explore Our Company",
    "stats": [
      {"label": "Years of Service", "value": "10+"},
      {"label": "Active Members", "value": "120+"},
      {"label": "Officers", "value": "15"},
      {"label": "Annual Activities", "value": "25+"}
    ]
  }'::jsonb,
  seo = '{"site_title": "The Royal Shepherds — [Company Name]", "meta_description": "Demo site for a Royal Shepherds company.", "keywords": ["Royal Shepherds","CAC","youth","Christian"]}'::jsonb
where id = true;

insert into ranks (name, short_name, display_order) values
  ('[Demo Rank 1]', 'DR1', 1),
  ('[Demo Rank 2]', 'DR2', 2),
  ('[Demo Rank 3]', 'DR3', 3);

insert into units (name, description, display_order) values
  ('1st Platoon', 'Demo unit — replace with your company''s actual unit/platoon structure', 1),
  ('2nd Platoon', 'Demo unit — replace with your company''s actual unit/platoon structure', 2),
  ('3rd Platoon', 'Demo unit — replace with your company''s actual unit/platoon structure', 3);

insert into officer_positions (title, display_order) values
  ('Company Captain', 1),
  ('Assistant Captain', 2),
  ('Secretary', 3),
  ('Treasurer', 4),
  ('Training Officer', 5);

-- Demo members (fictional; placeholders only)
insert into members (membership_number, full_name, status, public_profile, short_bio, joined_at, unit_id, rank_id)
select
  'RS-' || to_char(now(),'YYYY') || '-' || lpad(gs::text, 4, '0'),
  '[Demo Member ' || gs || ']',
  'active',
  (gs % 2 = 0),
  'Demo bio for seed member ' || gs || '. Replace with real member information.',
  current_date - (gs * 30 || ' days')::interval,
  (select id from units order by random() limit 1),
  (select id from ranks order by random() limit 1)
from generate_series(1, 8) as gs;

insert into news_categories (name, slug, display_order) values
  ('Announcements', 'announcements', 1),
  ('Events Recap', 'events-recap', 2),
  ('Testimonies', 'testimonies', 3);

insert into events (title, slug, description, short_description, start_date, start_time, location, category, status, registration_enabled)
values
  ('[Demo] Annual Company Camp', 'demo-annual-company-camp',
   'Full demo description of the annual company camp — replace with real content.',
   'A weekend of faith, fellowship and fun for all members.',
   current_date + interval '30 days', '09:00', '[Camp Ground, City]', 'Camp', 'published', true),
  ('[Demo] Leadership Training Workshop', 'demo-leadership-training-workshop',
   'Full demo description of the leadership training workshop.',
   'Hands-on training for officers and aspiring leaders.',
   current_date + interval '14 days', '10:00', '[Company Hall]', 'Training', 'published', true),
  ('[Demo] Community Outreach', 'demo-community-outreach',
   'Full demo description of the community outreach programme.',
   'Serving our community through practical acts of love.',
   current_date + interval '7 days', '08:00', '[Community Center]', 'Outreach', 'published', false);

insert into news (title, slug, excerpt, content, category_id, status, published_at, featured)
select
  '[Demo] Company Celebrates Successful Outreach',
  'demo-company-celebrates-successful-outreach',
  'Demo excerpt summarizing the news article in one or two sentences.',
  '<p>This is placeholder article content. Replace with real reporting from your company activities.</p>',
  (select id from news_categories where slug = 'events-recap'),
  'published', now(), true;

insert into gallery_albums (title, slug, description, album_date, published)
values
  ('[Demo] 2026 Company Camp', 'demo-2026-company-camp', 'Photos from the demo camp.', current_date - interval '60 days', true),
  ('[Demo] Leadership Retreat', 'demo-leadership-retreat', 'Photos from the demo retreat.', current_date - interval '120 days', true);

insert into resources (title, description, category, file_url, file_name, visibility)
values
  ('[Demo] Membership Form', 'Demo placeholder resource.', 'Forms', 'https://example.org/demo.pdf', 'membership-form.pdf', 'public'),
  ('[Demo] Officer Handbook', 'Demo placeholder resource.', 'Guidelines', 'https://example.org/demo2.pdf', 'officer-handbook.pdf', 'members');
