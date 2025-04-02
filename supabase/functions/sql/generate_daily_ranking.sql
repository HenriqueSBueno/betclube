-- Função para excluir rankings antigos de uma categoria
CREATE OR REPLACE FUNCTION public.delete_rankings_by_category(
  p_category_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Primeiro excluir os ranked_sites associados
  DELETE FROM public.ranked_sites
  WHERE ranking_id IN (
    SELECT id FROM public.daily_rankings WHERE category_id = p_category_id
  );
  
  -- Depois excluir os rankings
  DELETE FROM public.daily_rankings
  WHERE category_id = p_category_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_daily_ranking(
  category_id UUID,
  site_count INTEGER DEFAULT 10,
  min_votes INTEGER DEFAULT 0,
  max_votes INTEGER DEFAULT 100
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  category_name TEXT;
  new_ranking_id UUID;
  site_record RECORD;
  position_counter INTEGER := 1;
  random_votes INTEGER;
BEGIN
  -- Get category name
  SELECT name INTO category_name 
  FROM public.ranking_categories 
  WHERE id = category_id;
  
  IF category_name IS NULL THEN
    RAISE EXCEPTION 'Category not found';
  END IF;
  
  -- Delete existing rankings for this category
  PERFORM delete_rankings_by_category(category_id);
  
  -- Create new ranking
  INSERT INTO public.daily_rankings (
    category_id, 
    category_name,
    generation_date,
    expiration
  ) VALUES (
    category_id,
    category_name,
    now(),
    now() + interval '1 day'
  ) RETURNING id INTO new_ranking_id;
  
  -- Select sites for this category
  FOR site_record IN (
    SELECT id 
    FROM public.betting_sites 
    WHERE category_name = ANY(category)
    ORDER BY RANDOM()
    LIMIT site_count
  ) LOOP
    -- Generate random votes within the specified range
    random_votes := floor(random() * (max_votes - min_votes + 1) + min_votes)::INTEGER;
    
    -- Insert ranked site
    INSERT INTO public.ranked_sites (
      ranking_id, 
      site_id, 
      position,
      votes
    ) VALUES (
      new_ranking_id,
      site_record.id,
      position_counter,
      random_votes
    );
    
    position_counter := position_counter + 1;
  END LOOP;
  
  RETURN new_ranking_id;
END;
$$;

-- Função auxiliar para incrementar votos
CREATE OR REPLACE FUNCTION public.increment_site_votes(
  p_ranking_id UUID,
  p_site_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ranked_sites
  SET votes = votes + 1
  WHERE ranking_id = p_ranking_id AND site_id = p_site_id;
END;
$$;
