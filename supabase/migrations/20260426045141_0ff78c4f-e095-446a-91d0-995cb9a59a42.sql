-- Replace demo Event Pro avatars with more realistic, candid portraits of food/beverage professionals
-- Distribute across all demo pros (UUIDs starting with 22222222-aaaa)

WITH realistic_avatars(idx, url) AS (
  VALUES
    (0, 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=400&fit=crop&q=80'),  -- chef plating
    (1, 'https://images.unsplash.com/photo-1583394293214-28a4b0028d6f?w=400&h=400&fit=crop&q=80'),  -- bartender
    (2, 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?w=400&h=400&fit=crop&q=80'),  -- chef portrait
    (3, 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?w=400&h=400&fit=crop&q=80'),  -- barista
    (4, 'https://images.unsplash.com/photo-1622021142947-da7dedc7c39a?w=400&h=400&fit=crop&q=80'),  -- baker
    (5, 'https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=400&h=400&fit=crop&q=80'),  -- food truck cook
    (6, 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=400&h=400&fit=crop&q=80'),  -- chef in kitchen
    (7, 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=400&fit=crop&q=80'),  -- bartender pouring
    (8, 'https://images.unsplash.com/photo-1571805341302-f857807a3203?w=400&h=400&fit=crop&q=80'),  -- woman chef
    (9, 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop&q=80'),  -- baker with bread
    (10, 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=400&fit=crop&q=80'), -- chef cooking
    (11, 'https://images.unsplash.com/photo-1531316282956-d38457be0993?w=400&h=400&fit=crop&q=80'), -- pastry chef
    (12, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80'), -- friendly woman portrait
    (13, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80'), -- man portrait
    (14, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80')  -- woman portrait
)
UPDATE profiles p
SET avatar_url = ra.url
FROM realistic_avatars ra
WHERE p.user_id::text LIKE '22222222-aaaa%'
  AND ra.idx = (('x' || substr(md5(p.user_id::text), 1, 8))::bit(32)::int & 2147483647) % 15;