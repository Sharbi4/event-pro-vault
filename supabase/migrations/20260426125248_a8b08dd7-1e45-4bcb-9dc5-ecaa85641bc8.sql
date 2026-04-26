DO $$
DECLARE
  bartending text[] := ARRAY[
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80',
    'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=1200&q=80',
    'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=1200&q=80',
    'https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?w=1200&q=80',
    'https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1200&q=80',
    'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&q=80',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=1200&q=80',
    'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=1200&q=80',
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=1200&q=80',
    'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80',
    'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=1200&q=80',
    'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=1200&q=80'
  ];
  catering text[] := ARRAY[
    'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=1200&q=80',
    'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80'
  ];
  coffee text[] := ARRAY[
    'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=1200&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80',
    'https://images.unsplash.com/photo-1515442261605-65987783cb6a?w=1200&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1200&q=80',
    'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=1200&q=80',
    'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200&q=80'
  ];
  desserts text[] := ARRAY[
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200&q=80',
    'https://images.unsplash.com/photo-1542884748-2b87b36c6b90?w=1200&q=80',
    'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=1200&q=80',
    'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=1200&q=80',
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=80',
    'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=1200&q=80',
    'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&q=80',
    'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1200&q=80',
    'https://images.unsplash.com/photo-1615832494873-b0c52d519696?w=1200&q=80',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1200&q=80'
  ];
  food_trucks text[] := ARRAY[
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1200&q=80',
    'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=1200&q=80',
    'https://images.unsplash.com/photo-1558030006-450675393462?w=1200&q=80',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200&q=80',
    'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=1200&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&q=80',
    'https://images.unsplash.com/photo-1611250188496-e966043a0629?w=1200&q=80',
    'https://images.unsplash.com/photo-1613564834361-9436948817d1?w=1200&q=80',
    'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=1200&q=80',
    'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=1200&q=80',
    'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1200&q=80',
    'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?w=1200&q=80',
    'https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=1200&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&q=80',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=1200&q=80',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=1200&q=80',
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=1200&q=80',
    'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=1200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1601314002592-b8734bca6604?w=1200&q=80',
    'https://images.unsplash.com/photo-1593504049359-74330189a345?w=1200&q=80',
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=1200&q=80',
    'https://images.unsplash.com/photo-1542528180-a1208c5169a5?w=1200&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80'
  ];
  private_chef text[] := ARRAY[
    'https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?w=1200&q=80',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80',
    'https://images.unsplash.com/photo-1574484284002-952d92456975?w=1200&q=80',
    'https://images.unsplash.com/photo-1531316282956-d38457be0993?w=1200&q=80',
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80',
    'https://images.unsplash.com/photo-1470114716159-e389f8712fda?w=1200&q=80',
    'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=1200&q=80',
    'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=1200&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80',
    'https://images.unsplash.com/photo-1564759224907-65b945ff0e84?w=1200&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&q=80'
  ];
  pool jsonb := jsonb_build_object(
    'bartending', to_jsonb(bartending),
    'catering', to_jsonb(catering),
    'coffee-beverage', to_jsonb(coffee),
    'desserts', to_jsonb(desserts),
    'food-trucks', to_jsonb(food_trucks),
    'private-chef', to_jsonb(private_chef)
  );
BEGIN
  WITH ranked AS (
    SELECT
      vp.id,
      vp.category,
      (ROW_NUMBER() OVER (PARTITION BY vp.category ORDER BY vp.name, vp.id) - 1)::int AS idx,
      jsonb_array_length(pool -> vp.category) AS pool_size
    FROM public.vendor_packages vp
    WHERE vp.category = ANY (ARRAY['bartending','catering','coffee-beverage','desserts','food-trucks','private-chef'])
  )
  UPDATE public.vendor_packages vp
  SET cover_image_url = (
    pool -> ranked.category ->> ((ranked.idx % ranked.pool_size)::int)
  )
  FROM ranked
  WHERE vp.id = ranked.id;
END $$;