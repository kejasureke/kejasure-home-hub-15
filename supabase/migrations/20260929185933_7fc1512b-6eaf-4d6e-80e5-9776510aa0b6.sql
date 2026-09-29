DROP POLICY IF EXISTS "Listing images viewable by all" ON public.listing_images;
CREATE POLICY "Listing images visible for active or own listings" ON public.listing_images FOR SELECT
USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND (l.status = 'active' OR l.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

DROP POLICY IF EXISTS "Listing videos viewable by all" ON public.listing_videos;
CREATE POLICY "Listing videos visible for active or own listings" ON public.listing_videos FOR SELECT
USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND (l.status = 'active' OR l.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

DROP POLICY IF EXISTS "Price history viewable by all" ON public.price_history;
CREATE POLICY "Price history visible for active or own listings" ON public.price_history FOR SELECT
USING (EXISTS (SELECT 1 FROM public.listings l WHERE l.id = listing_id AND (l.status = 'active' OR l.owner_id = auth.uid() OR private.has_role(auth.uid(),'admin'))));

DROP POLICY IF EXISTS "Reviews viewable by all" ON public.reviews;
CREATE POLICY "Reviews viewable by signed-in users" ON public.reviews FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Neighborhood scores viewable by all" ON public.neighborhood_scores;
CREATE POLICY "Neighborhood scores viewable by signed-in users" ON public.neighborhood_scores FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars read own or linked to profile" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (
  (auth.uid())::text = (storage.foldername(name))[1]
  OR private.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.avatar_url LIKE '%' || objects.name)
));

DROP POLICY IF EXISTS "Listing media public read" ON storage.objects;
CREATE POLICY "Listing media read own or active listing" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'listing-media' AND (
  (auth.uid())::text = (storage.foldername(name))[1]
  OR private.has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.listing_images li JOIN public.listings l ON l.id = li.listing_id
             WHERE l.status = 'active' AND li.url LIKE '%' || objects.name)
  OR EXISTS (SELECT 1 FROM public.listing_videos lv JOIN public.listings l ON l.id = lv.listing_id
             WHERE l.status = 'active' AND lv.url LIKE '%' || objects.name)
));