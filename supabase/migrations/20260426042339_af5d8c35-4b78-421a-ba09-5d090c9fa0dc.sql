
DO $$
DECLARE
  v_user_id uuid;
  rec RECORD;
  idx int := 100;
BEGIN
  FOR rec IN
    SELECT * FROM (VALUES
      ('la-pasta-pop','Pasta Pop LA','Hand-rolled pasta bar served fresh from a mobile kitchen.','Los Angeles','CA','90026',34.0782,-118.2606,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
      ('la-poke-cart','Pacific Poke Cart','Mobile poke bowl bar with sustainable seafood.','Los Angeles','CA','90291',33.9925,-118.4695,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'),
      ('la-coffee-cruiser','Sunset Coffee Cruiser','Vintage truck espresso bar with single-origin beans.','Los Angeles','CA','90028',34.1016,-118.3267,ARRAY['coffee-beverage','food-trucks'],'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80','https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80'),
      ('la-donut-darling','Donut Darling','Mini donut cart with custom glazes made on-site.','Los Angeles','CA','90019',34.0480,-118.3505,ARRAY['desserts','food-trucks'],'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&q=80','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'),
      ('la-grazing-co','Coastal Grazing Co.','Stunning grazing tables and charcuterie spreads.','Los Angeles','CA','90402',34.0259,-118.4965,ARRAY['catering'],'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1200&q=80','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'),
      ('atx-brisket-bus','Brisket Bus ATX','Slow-smoked brisket and ribs from a converted school bus.','Austin','TX','78702',30.2611,-97.7270,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
      ('atx-marg-machine','Margarita Machine ATX','Frozen margarita and craft cocktail trailer.','Austin','TX','78704',30.2515,-97.7626,ARRAY['bartending','coffee-beverage'],'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
      ('atx-kolache-co','Hill Country Kolaches','Fresh-baked kolaches and Czech pastries.','Austin','TX','78745',30.2266,-97.7922,ARRAY['desserts','catering'],'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'),
      ('atx-veggie-truck','Verde Mobile Vegan','Plant-based food truck with global street-food flavors.','Austin','TX','78751',30.3089,-97.7271,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
      ('atx-private-chef-juniper','Juniper Private Chef','Multi-course tasting menus prepared in your home.','Austin','TX','78731',30.3526,-97.7686,ARRAY['private-chef','catering'],'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'),
      ('atl-soul-truck','Southern Soul Mobile','Mobile southern comfort food.','Atlanta','GA','30312',33.7556,-84.3856,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1200&q=80','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
      ('atl-bourbon-bar','Bourbon & Branch Mobile Bar','Whiskey-forward mobile bar.','Atlanta','GA','30308',33.7716,-84.3791,ARRAY['bartending','catering'],'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
      ('atl-empanada-co','ATL Empanada Co.','Hand-pressed Latin empanadas with chimichurri.','Atlanta','GA','30307',33.7621,-84.3415,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1604908554027-9da3a9a8c5e7?w=1200&q=80','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'),
      ('atl-pie-cart','Peachtree Pie Cart','Mini pies and Southern desserts cart.','Atlanta','GA','30309',33.7895,-84.3853,ARRAY['desserts','catering'],'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=1200&q=80','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'),
      ('atl-chef-magnolia','Magnolia Private Chef','Refined Southern tasting menus with local farm ingredients.','Atlanta','GA','30327',33.8651,-84.4145,ARRAY['private-chef','catering'],'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'),
      ('phx-taco-trolley','Sonora Taco Trolley','Authentic Sonoran tacos and street corn.','Phoenix','AZ','85003',33.4484,-112.0740,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
      ('phx-tiki-bar','Desert Tiki Mobile Bar','Tropical tiki bar trailer with rum cocktails.','Phoenix','AZ','85016',33.5102,-112.0319,ARRAY['bartending','catering'],'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
      ('phx-pizza-oven','Camelback Wood-Fired Pizza','Mobile wood-fired pizza oven for weddings.','Phoenix','AZ','85018',33.5022,-111.9787,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80','https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80'),
      ('phx-gelato-cart','Vista Gelato Cart','Italian gelato and sorbet cart with seasonal flavors.','Phoenix','AZ','85020',33.5722,-112.0746,ARRAY['desserts','food-trucks'],'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=1200&q=80','https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'),
      ('phx-chef-agave','Agave Private Chef','Modern Southwestern tasting menus served in your home.','Phoenix','AZ','85048',33.3062,-112.0473,ARRAY['private-chef','catering'],'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'),
      ('tuc-sonora-truck','Barrio Sonora Hot Dogs','Tucson-style Sonoran hot dogs and street fare.','Tucson','AZ','85701',32.2226,-110.9747,ARRAY['food-trucks','catering'],'https://images.unsplash.com/photo-1612392062798-2dab2c8d2cc6?w=1200&q=80','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80'),
      ('tuc-craft-bar','Catalina Craft Mobile Bar','Craft cocktail trailer with desert botanicals and mezcal.','Tucson','AZ','85705',32.2540,-110.9742,ARRAY['bartending','catering'],'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80','https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'),
      ('tuc-coffee-cart','Saguaro Coffee Cart','Pour-over and espresso cart for Tucson events.','Tucson','AZ','85716',32.2533,-110.9301,ARRAY['coffee-beverage','food-trucks'],'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80','https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80'),
      ('tuc-chef-ocotillo','Ocotillo Private Chef','Plated Southwestern dinners and intimate chef tables.','Tucson','AZ','85718',32.3170,-110.9474,ARRAY['private-chef','catering'],'https://images.unsplash.com/photo-1565895405138-6c3a1555da6a?w=1200&q=80','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80'),
      ('tuc-bakery','Mission Cottage Bakery','Custom wedding cakes and dessert tables.','Tucson','AZ','85710',32.2076,-110.8412,ARRAY['desserts','catering'],'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=80','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80')
    ) AS t(username, biz, descr, city, state, zip, lat, lng, cats, cover, avatar)
  LOOP
    IF EXISTS (SELECT 1 FROM profiles WHERE username = rec.username) THEN
      CONTINUE;
    END IF;

    v_user_id := ('22222222-aaaa-4aaa-aaaa-' || lpad(idx::text, 12, '0'))::uuid;
    idx := idx + 1;

    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
    ) VALUES (
      v_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      rec.username || '@demo.eventpro.test', crypt('demo-password-' || rec.username, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', rec.biz),
      false, false
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO profiles (user_id, full_name, display_name, username, avatar_url, is_vendor, profile_type, is_published, approval_status, primary_city, short_bio, onboarding_completed_at, email, trust_score)
    VALUES (v_user_id, rec.biz, rec.biz, rec.username, rec.avatar, true, 'vendor', true, 'approved', rec.city, rec.descr, now(), rec.username || '@demo.eventpro.test', 75)
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name, display_name = EXCLUDED.display_name, username = EXCLUDED.username,
      avatar_url = EXCLUDED.avatar_url, is_vendor = true, profile_type = 'vendor',
      is_published = true, approval_status = 'approved', primary_city = EXCLUDED.primary_city,
      short_bio = EXCLUDED.short_bio, onboarding_completed_at = EXCLUDED.onboarding_completed_at,
      email = EXCLUDED.email, trust_score = 75;

    INSERT INTO vendor_details (user_id, business_name, business_description, service_categories, city, state, zip_code, base_location_lat, base_location_lng, formatted_address, cover_image_url, travel_radius_miles, travel_fee_enabled, accepts_stripe, payment_methods)
    VALUES (v_user_id, rec.biz, rec.descr, rec.cats, rec.city, rec.state, rec.zip, rec.lat, rec.lng, rec.city || ', ' || rec.state, rec.cover, 35, true, true, ARRAY['stripe'])
    ON CONFLICT (user_id) DO UPDATE SET
      business_name = EXCLUDED.business_name, business_description = EXCLUDED.business_description,
      service_categories = EXCLUDED.service_categories, city = EXCLUDED.city, state = EXCLUDED.state,
      zip_code = EXCLUDED.zip_code, base_location_lat = EXCLUDED.base_location_lat,
      base_location_lng = EXCLUDED.base_location_lng, cover_image_url = EXCLUDED.cover_image_url;

    INSERT INTO vendor_packages (user_id, name, description, type, price, min_units, category, cover_image_url, images, pricing_type, min_hours, duration_minutes, booking_mode, payment_options, is_active, is_published, status, package_kind, starting_at, min_guests, included_travel_miles, fee_per_mile, max_travel_miles, cancellation_policy)
    VALUES
      (v_user_id, rec.biz || ' • Pop-Up Service', 'On-site pop-up service for your event. We handle setup, service, and breakdown.', 'HOURLY', 750, 2, rec.cats[1], rec.cover, ARRAY[rec.cover], 'hourly', 2, 120, 'REQUEST', 'ONLINE', true, true, 'published', 'pull_up', 750, 25, 15, 2.50, 50, 'standard'),
      (v_user_id, rec.biz || ' • Full Catering', 'Full-service catering with custom menu, staff, and setup.', 'HOURLY', 2400, 1, rec.cats[1], rec.cover, ARRAY[rec.cover], 'flat', 3, 240, 'REQUEST', 'ONLINE', true, true, 'published', 'catering', 2400, 40, 25, 3.00, 75, 'standard');
  END LOOP;
END $$;
