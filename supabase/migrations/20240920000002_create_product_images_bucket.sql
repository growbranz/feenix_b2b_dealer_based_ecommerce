-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read for product images
CREATE POLICY product_images_public_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images'
  );

-- Policy: Allow authenticated users to upload product images
CREATE POLICY product_images_insert_authenticated ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
  );

-- Policy: Allow dealers to delete their own product images
CREATE POLICY product_images_delete_own ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (
      -- Extract dealer_id from path: products/{dealer_id}/{productId}/{filename}
      auth.uid()::text = split_part(name, '/', 2)
      OR is_admin()
    )
  );

-- Policy: Allow dealers to update their own product images
CREATE POLICY product_images_update_own ON storage.objects
  FOR UPDATE WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND (
      auth.uid()::text = split_part(name, '/', 2)
      OR is_admin()
    )
  );

-- Add comment for documentation
COMMENT ON STORAGE BUCKET 'product-images' IS 'Storage bucket for product images. Path format: products/{dealer_id}/{product_id}/{filename}';
