-- Migration: Fix handle_new_user to extract Google OAuth names correctly
-- Google stores names as given_name/family_name, not first_name/last_name.
-- Also handles full_name/name fallback by splitting on first space.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Try first_name, then given_name (Google OAuth)
  v_first_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(new.raw_user_meta_data->>'given_name'), '')
  );

  -- Try last_name, then family_name (Google OAuth)
  v_last_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data->>'last_name'), ''),
    NULLIF(TRIM(new.raw_user_meta_data->>'family_name'), '')
  );

  -- Fallback: split full_name or name
  IF v_first_name IS NULL OR v_last_name IS NULL THEN
    v_full_name := COALESCE(
      NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(new.raw_user_meta_data->>'name'), '')
    );
    IF v_full_name IS NOT NULL THEN
      IF v_first_name IS NULL THEN
        v_first_name := SPLIT_PART(v_full_name, ' ', 1);
      END IF;
      IF v_last_name IS NULL AND POSITION(' ' IN v_full_name) > 0 THEN
        v_last_name := SUBSTRING(v_full_name FROM POSITION(' ' IN v_full_name) + 1);
      END IF;
    END IF;
  END IF;

  -- Avatar: try avatar_url then picture (Google OAuth)
  v_avatar_url := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture'
  );

  INSERT INTO public.profiles (id, first_name, last_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(v_first_name, ''),
    COALESCE(v_last_name, ''),
    v_avatar_url
  );

  RETURN new;
END;
$$;

-- Backfill: update existing profiles that have empty names but auth metadata has names
UPDATE public.profiles p
SET
  first_name = COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'given_name'), ''),
    NULLIF(SPLIT_PART(
      COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'name'), '')
      ),
      ' ', 1
    ), ''),
    p.first_name
  ),
  last_name = COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'last_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'family_name'), ''),
    CASE
      WHEN POSITION(' ' IN COALESCE(
        NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
        ''
      )) > 0
      THEN SUBSTRING(
        COALESCE(
          NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
          NULLIF(TRIM(u.raw_user_meta_data->>'name'), '')
        )
        FROM POSITION(' ' IN COALESCE(
          NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
          NULLIF(TRIM(u.raw_user_meta_data->>'name'), '')
        )) + 1
      )
      ELSE NULL
    END,
    p.last_name
  ),
  avatar_url = COALESCE(
    p.avatar_url,
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
FROM auth.users u
WHERE p.id = u.id
  AND (p.first_name = '' OR p.last_name = '');
