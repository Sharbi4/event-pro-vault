-- Assign avatars + cover/gallery images to demo Event Pros and packages
-- Uses Unsplash hotlinks (free, stable photo IDs)

UPDATE profiles SET avatar_url = CASE user_id::text
  WHEN '11111111-aaaa-4aaa-aaaa-000000000001' THEN 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000002' THEN 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000003' THEN 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000004' THEN 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000005' THEN 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000006' THEN 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000007' THEN 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000008' THEN 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000009' THEN 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000010' THEN 'https://images.unsplash.com/photo-1612392062798-2dfb1fc1335a?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000011' THEN 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000012' THEN 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000013' THEN 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000014' THEN 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80'
  WHEN '11111111-aaaa-4aaa-aaaa-000000000015' THEN 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop&q=80'
END
WHERE user_id::text LIKE '11111111-aaaa%';

UPDATE vendor_packages SET
  cover_image_url = 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1200&q=80',
  images = ARRAY[
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80'
  ]
WHERE category = 'food-trucks' AND user_id::text LIKE '11111111-aaaa%';

UPDATE vendor_packages SET
  cover_image_url = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
  images = ARRAY[
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&q=80'
  ]
WHERE category = 'catering' AND user_id::text LIKE '11111111-aaaa%';

UPDATE vendor_packages SET
  cover_image_url = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80',
  images = ARRAY[
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80'
  ]
WHERE category = 'bartending' AND user_id::text LIKE '11111111-aaaa%';

UPDATE vendor_packages SET
  cover_image_url = 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=80',
  images = ARRAY[
    'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80'
  ]
WHERE category = 'desserts' AND user_id::text LIKE '11111111-aaaa%';

UPDATE vendor_packages SET
  cover_image_url = 'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?w=1200&q=80',
  images = ARRAY[
    'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80'
  ]
WHERE category = 'private-chef' AND user_id::text LIKE '11111111-aaaa%';

UPDATE vendor_packages SET
  cover_image_url = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
  images = ARRAY[
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=80'
  ]
WHERE category = 'coffee-beverage' AND user_id::text LIKE '11111111-aaaa%';