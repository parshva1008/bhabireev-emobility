# Bhabireev E-Mobility — Full-stack website starter

This is a React + Vite customer website and separate owner workspace using Supabase Auth, PostgreSQL, and Storage. It is designed to be hosted online and used from both laptop and phone. **It is not production-ready until you complete the setup and security checklist below.** The project intentionally contains no hard-coded admin password or secret key.

## What is included
- Customer marketplace with responsive design, listing search and filters, vehicle details, and enquiry form.
- Dedicated owner sign-in and multi-page workspace: overview, inventory, enquiries, reports, and website settings.
- Owner can add/edit/delete listings, upload photos, change status, publish/unpublish listings, and update business details.
- Shared online PostgreSQL database and image storage through Supabase.
- Row Level Security (RLS) SQL policies: visitors can only read published available vehicles and submit enquiries; owner can manage inventory, enquiries, settings, and photos.
- CSV inventory export.

## 1. Prerequisites
Install Node.js LTS and VS Code. You need a Supabase account and a hosting account (Vercel or Netlify). The website runs in Chrome, but Chrome itself is not a hosting service. To publish it, you need a hosting provider such as Vercel or Netlify and a Supabase project.

## 2. Create your database and secure owner account
1. Create a new Supabase project. Save the database password securely.
2. In Supabase, open **SQL Editor**, paste and run `supabase/schema.sql`.
3. In **Authentication settings**, disable public sign-ups. The website does not offer public owner registration.
4. In **Authentication → Users**, create your owner account using your own email and a strong unique password. Enable MFA for the owner account if available.
5. Copy the new owner's **User UID**. In SQL Editor run:
   ```sql
   insert into public.admin_users (user_id) values ('PASTE-YOUR-OWNER-USER-UUID-HERE');
   ```
   Use the exact UUID from Authentication → Users. Do not use your email in place of the UUID.
6. Verify the user is in `public.admin_users`. Only this allow-listed UID gets owner permissions.
7. Keep `service_role`/secret keys private. They must never be placed in frontend `.env` or shipped to the browser.

## 3. Connect the frontend
1. In Supabase project settings, copy the Project URL and the **publishable/anon client key**.
2. Copy `.env.example` to a new file named `.env` in the project root.
3. Fill in:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_ANON_KEY
   ```
   This is the public client key, not the `service_role` secret. RLS is what protects the data.
4. In VS Code Terminal, run:
   ```powershell
   npm install
   npm run dev
   ```
5. Open the localhost URL Vite prints (typically `http://localhost:5173`). Go to `/owner/login` and sign in with the owner account you created.
6. Add a test vehicle, upload a photo, publish it, then open the customer home page in a private browser window to verify visitors can see only published/available listings. Submit a test enquiry and verify it appears in the owner dashboard.

## 4. Build and host publicly
1. Run `npm run build`. The output folder is `dist`.
2. Push the project to a private or public Git repository (never commit `.env`). Add `.env` to `.gitignore` before pushing.
3. Import the repository into Vercel or Netlify.
4. Add the two `VITE_SUPABASE_*` environment variables in the hosting dashboard.
5. Build command: `npm run build`; output directory: `dist`.
6. Configure SPA fallback/rewrites so routes like `/owner/login` resolve to `index.html`. Netlify's `_redirects` file is included; for Vercel, use a rewrite to `/index.html`.
7. In Supabase Authentication URL configuration, set the production site URL and allowed redirect URLs to your actual hosted domain. Do not use a wildcard URL unnecessarily.
8. Open the hosted domain in Chrome on laptop and phone. Your data will be shared because both clients use the same Supabase project.

## 5. Before accepting real customer data — security checklist
- Keep public sign-ups disabled. Create owner accounts only through Supabase dashboard; allow-list only the exact owner's Auth UUID in `admin_users`.
- Turn on MFA for owner accounts. Use a strong unique password and a password manager.
- Keep Supabase `service_role`/secret key private. Never use it in Vite, browser code, source control, screenshots, or public chats.
- Review Supabase Security Advisor and database policies before launch. Test that an anonymous visitor cannot list all enquiries or alter inventory/settings.
- Configure rate limiting / CAPTCHA or an edge/server-side abuse control for public enquiry submissions before launch; RLS alone does not stop spam.
- Configure backups and test restoring them. Keep local exports of important business records.
- Publish an accurate privacy notice and explain how contact details are used. Collect only information you need and restrict staff access.
- Use real vehicle photos and verify ownership, documents, price, condition, battery claims, and availability. Never claim a battery was tested unless you have evidence.
- Use HTTPS hosting. Do not collect payment-card details in this app. Use a trusted payment provider if online payments are added.
- For deleting vehicle photos, remove old objects from Storage separately; deleting a database listing does not automatically delete its image files.

## Notes / known scope
- This starter provides real online database/auth/storage integration once configured; it is not a hosted service until you deploy it.
- Public enquiry form uses client-side validation plus database constraints/RLS. Add CAPTCHA and rate limiting before exposing widely.
- Current reports are live snapshots, not accounting. Profit/revenue reports need actual transaction amounts, fees, and sale dates.
- Contact settings are editable and saved, but adding a WhatsApp click-to-chat button or email notifications requires additional implementation/configuration.
- The home page shows example cards only when Supabase isn't configured, clearly labelled as preview. Remove these sample listings from source before launch if you prefer an empty catalogue.
