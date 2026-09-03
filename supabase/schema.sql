-- =========================================================================
-- TOP GSS - SCHEMA POSTGRESQL & POLITIQUES RLS SUPABASE
-- =========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  avatar_url TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour accélérer les recherches et vérifications
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 3. TRIGGER DE SYNCHRONISATION AUTH.USERS -> PUBLIC.PROFILES
-- Crée automatiquement le profil avec status = 'pending' et role = 'user'
-- Si l'e-mail est l'administrateur principal (myuantojah@gmail.com), il est directement 'admin' et 'approved'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'user';
  v_status TEXT := 'pending';
BEGIN
  IF lower(NEW.email) = 'myuantojah@gmail.com' THEN
    v_role := 'admin';
    v_status := 'approved';
  END IF;

  INSERT INTO public.profiles (id, username, phone, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    v_role,
    v_status
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    role = CASE WHEN lower(EXCLUDED.email) = 'myuantojah@gmail.com' THEN 'admin' ELSE public.profiles.role END,
    status = CASE WHEN lower(EXCLUDED.email) = 'myuantojah@gmail.com' THEN 'approved' ELSE public.profiles.status END,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. TABLE MESSAGES (CHAT REALTIME)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(trim(message)) > 0 AND char_length(message) <= 500),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON public.messages(user_id);

-- 5. ACTIVATION DU REALTIME POUR MESSAGES
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 6. SÉCURITÉ ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Fonctions helper de sécurité
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------------
-- POLITIQUES RLS SUR PROFILES
-- -------------------------------------------------------------
-- Tout utilisateur authentifié peut voir son profil, et les admins peuvent voir tous les profils
DROP POLICY IF EXISTS "Lecture profils pour utilisateur et admin" ON public.profiles;
CREATE POLICY "Lecture profils pour utilisateur et admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR public.is_admin()
    OR (status = 'approved') -- Les membres approuvés peuvent voir les profils (auteurs du chat)
  );

-- Un utilisateur peut mettre à jour ses propres infos (sauf role et status)
DROP POLICY IF EXISTS "Mise a jour de son propre profil" ON public.profiles;
CREATE POLICY "Mise a jour de son propre profil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );

-- L'administrateur a tous les droits de modification (changer status en 'approved' ou 'rejected')
DROP POLICY IF EXISTS "Admin peut tout modifier sur les profils" ON public.profiles;
CREATE POLICY "Admin peut tout modifier sur les profils"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -------------------------------------------------------------
-- POLITIQUES RLS SUR MESSAGES
-- -------------------------------------------------------------
-- Seuls les utilisateurs 'status = approved' peuvent lire les messages
DROP POLICY IF EXISTS "Lecture messages pour membres approuvés" ON public.messages;
CREATE POLICY "Lecture messages pour membres approuvés"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_approved() OR public.is_admin());

-- Seuls les utilisateurs 'status = approved' peuvent envoyer des messages
DROP POLICY IF EXISTS "Envoi messages pour membres approuvés" ON public.messages;
CREATE POLICY "Envoi messages pour membres approuvés"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.is_approved() OR public.is_admin())
    AND user_id = auth.uid()
    AND char_length(trim(message)) > 0
    AND char_length(message) <= 500
  );

-- Un utilisateur peut supprimer uniquement ses propres messages. Un admin peut supprimer tout message.
DROP POLICY IF EXISTS "Suppression messages par auteur ou admin" ON public.messages;
CREATE POLICY "Suppression messages par auteur ou admin"
  ON public.messages FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

-- -------------------------------------------------------------
-- 7. COMMANDE POUR DÉFINIR L'ADMINISTRATEUR PRINCIPAL
-- -------------------------------------------------------------
-- Exécutez cette commande dans l'éditeur SQL Supabase pour activer le compte administrateur :
UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE email = 'myuantojah@gmail.com';
