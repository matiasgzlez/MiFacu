-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert their own feedback" 
ON public.feedback 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own feedback (optional, but good for verification if we ever list it)
CREATE POLICY "Users can view their own feedback" 
ON public.feedback 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT INSERT, SELECT ON public.feedback TO authenticated;
