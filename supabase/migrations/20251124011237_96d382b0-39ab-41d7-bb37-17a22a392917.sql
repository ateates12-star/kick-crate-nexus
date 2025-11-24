-- Enable realtime for cart_items and favorites tables
ALTER TABLE cart_items REPLICA IDENTITY FULL;
ALTER TABLE favorites REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE favorites;