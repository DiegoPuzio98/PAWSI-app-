-- Add sex field to adoption_posts table
ALTER TABLE public.adoption_posts 
ADD COLUMN sex text CHECK (sex IN ('macho', 'hembra', 'no sé'));

-- Add sex field to lost_posts table
ALTER TABLE public.lost_posts 
ADD COLUMN sex text CHECK (sex IN ('macho', 'hembra', 'no sé'));

-- Add sex field to reported_posts table
ALTER TABLE public.reported_posts 
ADD COLUMN sex text CHECK (sex IN ('macho', 'hembra', 'no sé'));