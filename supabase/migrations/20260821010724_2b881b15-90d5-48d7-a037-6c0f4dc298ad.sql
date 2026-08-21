CREATE TABLE public.survey_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  survey_type text NOT NULL,
  touchpoint text NOT NULL,
  facility text NOT NULL,
  department text NOT NULL,
  question_id text NOT NULL,
  question_text text NOT NULL,
  response text,
  rating numeric,
  sentiment text,
  comment text
);
CREATE INDEX survey_responses_response_id_idx ON public.survey_responses (response_id);
CREATE INDEX survey_responses_created_at_idx ON public.survey_responses (created_at);
GRANT SELECT, INSERT ON public.survey_responses TO anon;
GRANT SELECT, INSERT ON public.survey_responses TO authenticated;
GRANT ALL ON public.survey_responses TO service_role;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit survey answers" ON public.survey_responses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read survey answers" ON public.survey_responses FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.department_weights (
  department text NOT NULL PRIMARY KEY,
  weight numeric NOT NULL DEFAULT 1.0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.department_weights TO anon;
GRANT SELECT, INSERT, UPDATE ON public.department_weights TO authenticated;
GRANT ALL ON public.department_weights TO service_role;
ALTER TABLE public.department_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read department weights" ON public.department_weights FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update department weights" ON public.department_weights FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can add department weights" ON public.department_weights FOR INSERT TO anon, authenticated WITH CHECK (true);

INSERT INTO public.department_weights (department, weight) VALUES
  ('Restaurant staff', 1.00),
  ('Front desk', 1.00),
  ('Housekeeping', 0.75),
  ('Culinary', 0.75),
  ('Banquet service', 0.50),
  ('Facility staff', 0.25);