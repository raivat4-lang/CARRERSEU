CREATE TYPE public.education_level AS ENUM ('class_10','class_12','diploma','graduate','post_graduate');
CREATE TYPE public.app_language AS ENUM ('english','hindi','marathi');
CREATE TYPE public.gender AS ENUM ('male','female','other','prefer_not_to_say');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  age INTEGER,
  gender public.gender,
  state TEXT,
  city TEXT,
  current_education public.education_level,
  preferred_language public.app_language NOT NULL DEFAULT 'english',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, phone, age, gender, state, city, current_education, preferred_language
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'age', '')::int,
    NULLIF(NEW.raw_user_meta_data ->> 'gender', '')::public.gender,
    NULLIF(NEW.raw_user_meta_data ->> 'state', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'city', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'current_education', '')::public.education_level,
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'preferred_language', '')::public.app_language, 'english')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();