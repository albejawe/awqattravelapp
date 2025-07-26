-- Create admin user with the specified credentials
-- Note: This will create the user directly in auth.users
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Insert the admin user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'albejawe@gmail.com',
        crypt('10468416', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        false,
        'authenticated'
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('10468416', gen_salt('bf')),
        updated_at = now()
    RETURNING id INTO admin_user_id;

    -- Get the user ID if it already existed
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'albejawe@gmail.com';
    END IF;

    -- Create profile for admin user
    INSERT INTO public.profiles (id, email)
    VALUES (admin_user_id, 'albejawe@gmail.com')
    ON CONFLICT (id) DO UPDATE SET
        email = 'albejawe@gmail.com',
        updated_at = now();

    -- Assign admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

END $$;