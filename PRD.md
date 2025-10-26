
## Table of contents

1. Core definition & goals
2. Terminology & conventions
3. Users, roles & permissions (detailed)
4. High-level architecture & tech stack (explicit)
5. Data model (descriptive tables & fields)
6. Brief generation UX & behavior (full)
7. Brief storage, visibility & gallery behavior (full)
8. Projects: upload, view, and lifecycle (full)
9. Views, upvotes, counts, retention & expiry rules
10. Comments & replies (full rules)
11. Reporting & moderation (full rules & UI behavior)
12. Token system & quotas (detailed)
13. Exporting & formats (exact behavior)
14. Search, filters & discover behavior (detailed)
15. Leaderboards & trending (detailed)
16. Badges & Milestones 
17. Navigation & UI specifics (exact layouts/messages)
18. Payments, Cashfree and Paypal flow & billing messages (detailed)
19. Password resets, login, and account deletion (detailed)
20. Security, link validation & safe browsing checks
21. Analytics & monitoring (tools & events)
22. Scheduled jobs, cron tasks & housekeeping
23. Moderation UI and workflows (detailed)
24. Data retention policies & auto-cleanup rules
25. Error handling, messages & email notifications
26. Admin, moderator capabilities & exemptions
27. Edge cases, consistency rules & conflicts resolved
28. Appendix: exact UI strings, reasons, and sample flows
29. Terms & Conditions
30. Privacy Policy

---

## 1. Core definition & goals

**Product**: NikharaBrief — a platform to generate creative briefs using AI, host project showcases, and enable community discovery through upvotes and leaderboards.

**Vision**: Provide instant, high-quality briefs for creatives and a fair, moderated stage for showcasing work built from those briefs — with monetization through paid subscriptions and non-intrusive ads for non-paying users.

**Primary goals**:

* Accurate AI brief generation by category / niche / industry with optional keyword inputs.
* Central brief storage (single canonical record) with `public` / `unlisted` visibility semantics.
* Project discovery, submission, and fair leaderboard competition (paid projects only compete).
* Clear moderation and reporting workflows.
* Affordable infra choices: Google AI Studio API, Cashfree, Paypal, GA4 (no heavy self-hosted analytics).
* UX clarity including warnings (disposable emails, immutable username, paid feature prompts).

---

## 2. Terminology & conventions

* **brief**: AI-generated or pre-stored creative brief for a hypothetical company/client and project.
* **project**: User-uploaded or user-created work produced in response to a brief (or manually created).
* **unlisted**: Brief visibility state meaning hidden from gallery/search but accessible via direct link or brief_id.
* **public**: Brief visible in gallery and search.
* **paid user**: Account with `payment = "paid"` — full feature set.
* **unpaid user**: Account with `payment = "unpaid"` — previously paid or created but not active for the current billing period; limited features.
* **free/anonymous**: No account row in DB; tracked via device_id cookie.
* **tokens**: Daily credits for generating briefs (non-stacking).
* **device_id**: Unique client cookie-based ID for anonymous tracking (used for views/upvotes/reports).
* **@username**: Unique user handle including leading `@` (e.g., `@alex`). Immutable for active accounts; reusable after account deletion.
* **GA4**: Google Analytics 4 (used for traffic and events).
* **GSC**: Google Search Console.
* **Clarity**: Microsoft Clarity (optional for heatmaps).
* **Cashfree and Paypal**: Payment and subscription processors.

All timestamps use UTC.

---

## 3. Users, roles & permissions

### 3.1 User types

**Free (Anonymous)**

* No DB row.
* Identified by device_id cookie.
* Can:

  * Generate briefs (token-limited).
  * View brief gallery and discover projects.
  * Upvote and share projects.
  * Report content (briefs/projects/comments).
* Cannot: save briefs, upload projects, comment/reply, compete in leaderboards, view brief history.

**Paid**

* DB row exists; `payment = "paid"`.
* Must verify email at signup; account created after payment confirmation in flow.
* Can:

  * Full brief generation (tokens).
  * Save unlimited briefs.
  * Set brief visibility (public / unlisted) for their generated briefs.
  * Upload projects (no limit).
  * Comment and reply (2-depth).
  * View brief history (last 5 generated briefs), saved briefs.
  * Projects automatically enter leaderboards and compete.
  * No ads.
* Extra:

  * Unlimited saved briefs.
  * No expiry of their views/upvotes data (retained indefinitely).

**Unpaid**

* DB row exists; `payment = "unpaid"`.
* Previously paid or account created without active subscription.
* Can:

  * Generate briefs (same daily tokens as anonymous: 30).
  * View saved briefs they already saved earlier, but cannot save new briefs.
  * View and compete projects they uploaded earlier; cannot upload new projects.
  * View and report comments; cannot comment.
  * See ads.
* Account exists; actions bind to user_id, not device_id.

**Moderator**

* DB row with `role = "moderator"`.
* Exempt from payment requirement (full access).
* Can:

  * Access moderation panels for briefs, projects, and comments.
  * Unlist briefs, delete projects (permanent), delete comments (apply deleted semantics).
  * View all the unlisted briefs.
  * Suspend users (custom durations).
  * View Suspicious Activity panel.
* Moderators do **not** have payment limitations.

**Admin**

* DB row with `role = "admin"`.
* Full control (billing, user management, moderator assignment).
* Exempt from payment.
* Can perform all moderation and admin actions.

### 3.2 Permission matrix (explicit)

* Generate briefs: Free/Unpaid/Paid (subject to tokens).
* Save brief: Paid only.
* Access Brief History: Paid only (only last 5 briefs are stored).
* Upload project: Paid only.
* Comment/Reply: Paid only.
* Upvote: Free & Paid & Unpaid.
* Report: Everyone (unique per item per user/device).
* View ads: Free & Unpaid only.
* Compete in leaderboards: Projects uploaded by Paid users and projects old projects that were uploaded by unpaid users.
* Moderation actions: Moderator and Admin only.

---

## 4. High-level architecture & tech stack (explicit)

**AI generation**: Google AI Studio API (confirmed).
**Payments**: Cashfree and Paypal for Billing & Checkout (confirmed).
**Analytics**: Google Analytics 4, Google Search Console, ( Microsoft Clarity later ).
**Frontend**: ensure dark-mode default and responsive.
**Link safety**: Google Safe Browsing check for external links validation.
**Hosting**: HTTPS, CDN-backed hosting; must accept Cashfree and Paypal webhooks and support server tasks/cron.

All integrations must use HTTPS. Backend must handle token logic, email verification, presentation of UI warnings, enforcement of report thresholds, scheduled jobs (leaderboards recompute hourly, token reset daily), and clean-up jobs.

---

## 5. Data model — descriptive

Below are the canonical data entities and the fields that will exist logically (for the PRD). Engineers will implement schemas accordingly.

### 5.1 Users (descriptive fields)

* `user_id` — unique internal id (UUID). For all the internal processes user_id should be used, username is for displaying in UI/UX.
* `username` — `@username` (string, unique while account exists).
* `email` — verified email address.
* `password_hash` — hashed password (stored securely).
* `display_name` — editable real name or handle.
* `bio` — text.
* `specializations` — list/array of 1 to 3 specializations.
* `profile_created_on` — date (DD/MM/YYYY).
* `payment` — `paid` | `unpaid`.
* `role` — `user` | `moderator` | `admin`.
* `no_of_projects` — integer for profile summary.
* `no_of_comments` — integer for profile summary.
* `total_upvotes` — integer for profile summary.
* `saved_briefs_count` — integer.
* `moderation_notes` — text for admin/moderator notes.
* `suspended_until` — timestamp if suspended.

**Business rules**:

* `username` always includes `@` prefix and is immutable while account exists. It becomes available for reuse only after the account is permanently deleted.
* Moderators/admins are payment-exempt and obtain full access to the app.
* The admin can create a new user account from admin panel which will be payment-exempt.

### 5.2 Briefs (descriptive fields)

* `brief_id` — unique brief id (canonical) (format : BRFYYYYMMDDHHMMSSXXX, where BRF is fixed, YYYY is year, MM is month, DD is date, HH is hour in 24 hour format, MM is minute, SS is second at which the brief was generated, and XXX is a number between 000 and 999 which makes the briefs unique if more than 1 brief is created in a second).
* `category` — selection input; lists to be provided later.
* `niche` — selection input; lists to be provided later.
* `industry` — selection input; lists to be provided later.
* `keywords` — optional input, list of keywords for brief generation and matching, the user have to tick the checkbox to include that specific keyword in prompt.
* `deadline` — time duration input , example : 1 day, 3 days, 1 week, 3 weeks, 1 month, etc, etc. The deadline should be automatically generated by the AI if the input is empty.
* `company_name` — nullable; should be uniue across briefs when provided.
* `company_description` — string; the description of the company/client, used in brief and project overview.
* `project_description` — string; the expected deliverable or task description.
* `brief_visibility` — `public` | `unlisted`.
* `brief_created_at` — internal timestamp (used for gallery rolling window).

**Rules & semantics**:

* Briefs are canonical; no per-user copies. Save in central store.
* On moderation, `brief_visibility` changes to `unlisted` (briefs are never deleted).
* `keywords` are used in UI to filter / match briefs during pre-generated brief selection and to support search.

### 5.3 Saved Briefs (descriptive)

* `user_id` — reference to user.
* `brief_id` — reference to brief.
* `date_added` — timestamp.

**Rules**:

* Only paid users can save new briefs.
* No limit on the number of saved briefs.
* When a brief becomes `unlisted`, remove saved_briefs rows for that brief.

### 5.4 Brief History (descriptive)

* Tracks last briefs generated by a user.
* `user_id`, `brief_id`, `generated_at`.
* Paid users can view their last 5 generated briefs from Brief History page.

### 5.5 Projects (descriptive fields)

* `project_id` — unique project id (format : PRJYYYYMMDDHHMMSSXXX, where PRJ is fixed, YYYY is year, MM is month, DD is date, HH is hour in 24 hour format, MM is minute, SS is second at which the project was uploaded, and XXX is a number between 000 and 999 which makes the project ids unique if more than 1 project is uploaded in a second).
* `brief_id` — nullable reference to brief if project linked to a brief.
* `heading` — required; main display title for the project.
* `description_by_user` — textual description by uploader; shown in full project view.
* `category`, `niche`, `industry` — either copied from linked brief (if brief_id provided) or manually provided on upload.
* `company_description` & `project_description` — copied from brief when linked, or provided manually for manual projects (only stored if manual upload).
* `external_link` — one allowed per project; must be HTTPS, no shorteners, HEAD returns 200, pass Safe Browsing API.
* `uploader_username` — `@username` or null if anonymized.
* `uploader_name` — stored display name or `[deleted user]` if anonymized.
* `project_submitted_at` — timestamp.
* `upvotes_count` — integer.
* `views_count` — integer.
* `comments` — relation of comments attached to project.

**Rules**:

* Projects uploaded by paid users automatically go to leaderboards (compete).
* Projects can be permanently deleted by moderators; deletion cascades to upvotes, views, comments, and reports.
* Projects linked to unlisted brief: project shows brief overview (company_description + project_description) but does not show brief_id in the project view or in DOM or anywhere else, brief_id is also hidden from code so no one can view it.

### 5.6 Views (descriptive)

* Tracks unique view by (project_id, user_id OR device_id).
* `last_viewed` timestamp updated when the same viewer revisits.
* For anonymous (free) users, records expire after 6 months of inactivity; `projects.views_count` is not decremented when records expire.
* For paid users, view records are retained permanently.

### 5.7 Upvotes (descriptive)

* Tracks unique upvote by (project_id, user_id OR device_id).
* Upvote counts are incremented on a new upvote.
* One upvote per user/device per project enforced.

### 5.8 Comments (descriptive)

* `comment_id` (format : CMTYYYYMMDDHHMMSSXXXX, where CMT is fixed, YYYY is year, MM is month, DD is date, HH is hour in 24 hour format, MM is minute, SS is second at which the comment was uploaded, and XXXX is a number between 0000 and 9999 which makes the comment ids unique if more than 1 comment is uploaded in a second), `project_id`, `parent_comment_id` (nullable), `commenter_username`, `content_html`, `created_at`, `is_deleted`, `moderation_status`.
* Max reply depth = 2 (comment → reply → reply).
* No comment edit feature.
* Deletion semantics: When a comment is deleted (by owner or moderator), set `is_deleted = true`, remove `commenter_username` (set to NULL), change `content_html` to `"Deleted"`. Child replies remain visible.

### 5.9 Reports (descriptive)

There are three logical report entities (project_reports, brief_reports, comment_reports) with the following common fields:

* `report_id` (format : RPTYYYYMMDDHHMMSSXXX, where RPT is fixed, YYYY is year, MM is month, DD is date, HH is hour in 24 hour format, MM is minute, SS is second at which the report was made, and XXX is a number between 000 and 999 which makes the report ids unique if more than 1 report is made in a second).
* `target_id` (brief_id/project_id/comment_id)
* `reporter_username` OR `reporter_device_id`
* `reason` — one of predefined categories
* `details` — optional free-form text
* `created_at`
* `action_taken` — `under_review` | `passed` | `deleted` | `unlisted` etc.

**Report categories** (explicit list):

* Sexual
* Violent / Repulsive
* Abusive / Harassment
* Dangerous Acts
* Misinformation
* Spam / Misleading
* Promotion
* Copyright Violation
* Malware / Security Risk
* Sensitive Brand / Trademark

**Rules**:

* One report per item per user/device (unique).
* Thresholds:

  * comment: 1 report → under_review
  * project: ≥2 distinct reports → under_review
  * brief: ≥2 distinct reports → under_review
* Reports for deleted target items are auto-deleted.

### 5.10 Password reset tokens (descriptive)

* `token_hash`, `user_id`, `expires_at`, `used` flag.
* Token is single-use, expires after 15 minutes.
* Throttle: max 3 reset requests per hour per account.
* If suspicious reset patterns from an IP, require CAPTCHA and flag moderation_notes.

### 5.11 Daily tokens (descriptive)

* Tracks daily token balance per user (if account exists) or per device (if anonymous).
* Fields: `date` (UTC date), `user_id` or `device_id`, `tokens_remaining`.
* Rules: create for current date on first use or via daily reset job.
* Cap: Paid = 150/day; Free/Unpaid = 30/day.
* Tokens cost: new brief = 10 tokens, random pre-generated brief = 1 token.
* Tokens do not carry over (no stacking).
* Reset occurs at 00:00 UTC; server ensures non-stacking semantics.

---

## 6. Brief generation UX & behavior (full)

### **6.1 Brief Generator: Categories, Niches, Industries, and Keywords**

The **Brief Generator** is the core feature of the platform where users (free/anonymous, unpaid, and paid) can generate or fetch AI-generated project briefs. It requires input selections such as **Category**, **Niche**, **Industry**, and **Keywords** (some keywords maybe optional).
All dropdowns are **search-enabled** and optimized for fast lookups.
Each input has a **default placeholder**, and when the user starts typing in search, suggestions appear dynamically.
All inputs are mandatory except keywords (some keywords are optional).

---

#### **Category: Game Development**

**Niche:**
Singleplayer, Multiplayer, MMO

**Industry (Platform):**
Mobile, PC, Console, Cross Platform (does not include web games), Web Based (also called Browser Games), Random

**Keywords (Used for generating brief, common for all subcategories):**
a) **Game Genres:**
Battle Royale, Shooter (FPS/TPS), Platformer, Fighting/Combat, Stealth, Survival, Metroidvania, Open World, Adventure, Horror, RPG, MOBA, Roguelike, Strategy, Idle, Tycoon, Simulation, Sports, Racing, Puzzle, Card/Deck, Detective, Casual/Party, Sandbox, Educational, Narrative/Visual Novel, or “Other (List them)”.

b) **Difficulty of Game Development Project:**
Easy, Medium, Hard

**Notes:**
For some selection combinations, specific things are assumed. For example, when *Party* and/or *Card Games* and *Singleplayer* are both selected together, it means that **BOTS** will be used in the game.

---

#### **Category: Graphics & Design**

**Niche:**
Motion Graphics, Logo & Brand Identity, UI/UX Design, Print Design, Art & Illustration, Character Modelling, Streaming Graphics, Books, Marketing Design, Visual Design (Includes Motion Graphics), Fashion & Merchandise.

**Industry:**
Entertainment, Gaming, Marketing, Technology, Finance, Food, Health, Retail Store, Real Estate, Fashion, Sports, Education, Transportation, Travel.

**Keywords:**
Decide according to the Niche.

---

#### **Category: Copywriting**

**Niche:**
Articles & Blogs, Scriptwriting, Speechwriting, Creative Writing, Podcast Writing, Research & Summaries, Content Editing, Career Writing, Business & Marketing, Social Media, Book & eBook Writing, Translation & Localization, Handwriting.

**Industry:**
Entertainment, Gaming, Marketing, Technology, Finance, Food, Health, Retail Store, Real Estate, Fashion, Sports, Education, Transportation, Travel.

**Keywords:**
Decide according to the Niche.

---

#### **Category: Music & Audio**

**Niche:**
Song Writers, Custom Songs, Voice Over, Audiobook Production, Audio Ads Production.

**Industry:**
Entertainment, Gaming, Marketing, Technology, Finance, Food, Health, Retail Store, Real Estate, Fashion, Sports, Education, Transportation, Travel.

**Keywords:**
Decide according to the Niche.

---

#### **Category: AI Services**

**Niche:**
Prompt Engineering, AI Mobile Apps, AI Websites & Softwares, AI Chatbot, AI Agents & Automations, AI Image Generation, AI Avatar Design, AI Video Avatars, AI Video Art, AI Music Videos, Text to Speech, AI Content Editing, ComfyUI Workflow Creation.

**Industry:**
Entertainment, Gaming, Marketing, Technology, Finance, Food, Health, Retail Store, Real Estate, Fashion, Sports, Education, Transportation, Travel.

**Keywords:**
Decide according to the Niche.

---

**Additional Notes:**

* All **Company/Client Names** must be unique — duplicate names are not allowed.
* The "Generate New Brief" consumes **10 tokens**, while "Get Pre-Generated Brief" (based on matching keywords/inputs) consumes **1 token**.
* All timestamps and token resets follow **UTC**.
* Brief generation uses the **category, industry, niche, and keywords combination** to determine tone and structure of AI outputs.
* In the admin panel, allow the admin to edit the category, niche, industry, keywords, etc. for brief generator so that it is easier to update.


### 6.2 UI behavior & flow

* Dropdowns for Category / Niche / Industry are **search-enabled**: user can begin typing to filter options. These lists must remain editable in admin UI.
* When user clicks "Generate New Brief":

  1. System checks token balance for user/device for today (UTC).
  2. If sufficient, deduct 10 tokens.
  3. Send prompt to Google AI Studio API with sanitized inputs: category/niche/industry/keywords/company_description/deadline and internal generation settings.
  4. On success:

     * System creates a new brief record in central briefs store.
     * If user is logged in (paid/unpaid), add to brief_history entry (for paid, visible via Brief History).
  5. On failure (e.g., AI quota reached) → fallback:

     * Attempt to return a stored brief that matches the category, niche, industry, and keywords (select one at random from the matches, if many).
     * This fallback still costs 10 tokens (same as generation).
  6. If the system fails to provide a brief to the user/device (for any reason), then give back 10 credits to the user/device.
* When user clicks "Get Pre-Generated Brief (random match)":

  1. System checks tokens (≥1).
  2. Deduct 1 token.
  3. Select **a whole brief** at random from the public briefs that matches the category, niche, industry, and keywords (select one at random from the matches, if many). Do not mix parts of different briefs.
  4. Return the brief to the user. If no brief is found that matches the category, niche, industry, and keywords, then give an error message to the user/device and give back 1 token.

### 6.3 Prompt filtering & safety

* Before sending prompt to Google AI Studio, perform server-side filter for profanity, hate, violence, adult content, sensitive brand names (configurable list).
* If filter matches, block generation and show exact message:

  * "Your prompt contains prohibited or sensitive terms. Edit and try again."
* Filtered brief attempts do not consume tokens.

### 6.4 Keywords usage (explicit)

* Keywords used in two places:

  * To bias AI generation for more specific output.
  * To match candidate pre-generated briefs for random selection: when a set of keywords is provided, random selection picks briefs that match *all* or *most* keywords (implement fuzzy match while guaranteeing full brief selection).

### 6.5 Output structure (explicit)

A brief must be returned in well-defined sections:

* Brief Metadata: brief_id, created_at
* Company Info: company_name (if present), company_description
* Project Overview: project_description
* Constraints: deadline, size/format/other constraints
* Visibility: brief_visibility = public | unlisted
* Save / Export Options: Export available for everyone, and save allowed only for paid users.

### 6.6 Post-generation options

* Save brief: Paid users can save indefinite number of briefs — clicking "Save" adds row to saved_briefs with `date_added`.
* Set visibility: Paid users can choose to make their generated brief `public` or `unlisted`. Default is `public`.
* Export: Users can export to txt, md, image (PNG), or pdf. Exports are identical for paid and free users and include watermark. Paid users get same export options and quality; paid users have no ads.

---

## 7. Brief storage, visibility & gallery behavior (full)

### 7.1 Central storage

* All briefs, whether AI-generated or pre-stored, are stored centrally (single canonical record). (If the user gets pre stored brief, there is no need to make new brief_id for it)
* No per-user duplicate copies exist.
* `brief_created_at` used internally for rolling windows and ranking.

### 7.2 Visibility states

* `public`:

  * Appears in Brief Gallery and search results.
  * Displays `brief_id` publicly.
* `unlisted`:

  * Hidden from gallery and filter-based searches.
  * Accessible via direct link `https://[domain]/briefs/brief_id` and via Brief ID search if the user enters brief_id explicitly in gallery search (see below for exact behavior).
  * When linked to a project, the project view shows only the overview (company_description + project_description) and **does not reveal brief_id** in the DOM.
  * Saved briefs referencing an unlisted brief are removed from saved_briefs, only when the brief is unlisted by moderation.

**Important UI rules for unlisted briefs**:

* The brief_id must never be present in the project page DOM or in any front-end accessible metadata if brief is unlisted. Always ensure server returns a null/empty brief_id for that scenario.
* The only way to access an unlisted brief is explicit knowledge of the brief_id or direct link (or if the owner views it in their profile).

### 7.3 Brief Gallery rolling & pagination

* Gallery window: public briefs generated in the last 72 hours of the rolling end timestamp (exclusive definition: if rolling_end is time T, briefs where brief_created_at ≥ T - 72h and < T).
* Rolling update: every 3 days (server computed). However, real-time request may compute window on demand, or a scheduled job can precompute the list.
* UI: default sort is **Newest** (no UI sort control).
* Pagination: initially load a subset of entries; "Load More" must be available for more items until the full set for the 72-hour window is displayed.
* Fallback: If user applies filters (category/niche/industry) and the selected category has fewer briefs, server will fetch older, public briefs at random (respecting no-duplicate rule across the page), until either the page fills or no more briefs exist.

### 7.4 No duplication

* The gallery must ensure no brief appears twice in the list. Use brief_id uniqueness for filtering duplicates.

### 7.5 Unique company names

* Company/Client names should be unique in the brief store to prevent duplicate headings on gallery cards.

---

## 8. Projects: upload, view, lifecycle (full)

### 8.1 Upload rules

* Only paid users can upload projects.
* Upload can be:

  * Linked to a `brief_id` (public or unlisted; project can link to unlisted but brief_id remains hidden in project view).
  * Manual: user provides category, niche, industry, company_description, and project_description fields.
* Each project may include exactly one external link.
* External link policy:

  * Must use HTTPS.
  * Must not be a URL shortener.
  * Backend performs an HTTP HEAD check (200 OK).
  * Must pass Google Safe Browsing API check.
  * No direct file uploads (exe, msi, mp3, mp4, png, jpeg, webp etc.) unless the link is to approved trusted service like Google Drive; platform disallows direct media hosting to avoid storage complexity.
* Projects must include `heading` (required) — this is the main textual identifier for the project across Discover, Leaderboards, and cards.

### 8.2 Project data (what appears where)

**Project card (Discover & Gallery)**:

* Heading (top, prominent).
* Company/Client description (fades out from up to down; short preview).
* Category / Niche / Industry (above byline).
* Byline: `by @username` (or `[deleted user]` if anonymized) (bottom-left).
* Views & Upvotes (bottom-right).

**Full project view**:

* Project ID displayed publicly.
* Brief ID displayed only if brief is public (not if unlisted).
* Heading (full).
* `description_by_user` (full).
* Category, niche, industry.
* External link (validated clickable).
* Uploader username (or `[deleted user]` if anonymized).
* Upvotes_count.
* Views_count.
* `project_submitted_at` timestamp (displayed as relative time in UI).
* Company_description & project_description (from linked brief or stored manual copy).
* Comments & replies list (paginated).

### 8.3 Project deletion & moderation

* Moderators can permanently delete a project. Deletion is irreversible; it removes the project record and all associated data (views, upvotes, comments, and reports).
* On deletion:

  * Show public message for the old URL: “The project you are trying to access does not exist or has been removed.”
  * Send email to uploader: subject “Your project has been removed” with reason and note that deletion is irreversible.

### 8.4 Project anonymity on account deletion

* If a user deletes their account (per account deletion flow), projects remain live but are anonymized: set `uploader_username = NULL` and `uploader_name = "[deleted user]"`. Projects continue to compete in leaderboards.

### 8.5 One external link per project

* Enforce exactly one external link field per project. This is for simplicity and safety checks.

---

## 9. Views, upvotes, counts, retention & expiry rules

### 9.1 Views

* Recording:

  * Each view is stored as a pair `(project_id, viewer)` where viewer is either `user_id` or `device_id`.
  * On first view for that pair, increment `projects.views_count`.
  * On subsequent views by same viewer, update `last_viewed` timestamp only.
* Retention:

  * Anonymous/device view records automatically deleted if the viewer does not return to the project in under 6 months. The `projects.views_count` will **not** be decremented when records are deleted.
  * For paid users, view records are retained permanently (no deletion).
* Use:

  * Views are used in leaderboards and trending calculations. Use validated vs raw counts for ranking (validated excludes suspicious activity).

### 9.2 Upvotes

* Each upvote is unique for `(project_id, user/device)`.
* On successful upvote, `projects.upvotes_count` increments.
* No upvote rate-limit required per user or device (you asked not to apply upvote rate-limit).
* Upvotes from paid/verified accounts are considered higher trust for fraud detection logic (not weighted for leaderboards unless you later request).

### 9.3 Counts invariant

* `projects.views_count` and `projects.upvotes_count` reflect historic totals and will not be decremented automatically by view record expiry.
* When a project is permanently deleted, its counts and associated records are removed.

---

## 10. Comments & replies (full rules)

### 10.1 Creation

* Only paid users can post comments & replies.
* Replies nesting: up to 2 levels deep (comment → reply → reply).
* Rate-limit: 1 comment or reply per user per project every 20 seconds (server-enforced).
* Max content length: 2500 characters.
* No edit functionality.

### 10.2 Display

* In UI, show relative time format: `23s ago`, `4 mins ago`, `3 hrs ago`, `5 days ago`, `1 week ago`, `7 months ago`, etc.
* Comment cards show commenter display name (fetched from users table), comment text (HTML sanitized), and time.

### 10.3 Deletion & anonymization

* Author or moderator can delete a comment.
* Deletion semantics: `is_deleted=true`, remove/NULL `commenter_username`, set `content_html` to `"Deleted"`. Replies (child comments) remain visible with their original content.
* On account deletion (user initiated), comments are anonymized by setting `commenter_username = NULL` and display text remains unless account deletion flow specifies removal — per final decision: keep comment text and anonymize identity (or if user requested full removal, different flow; default is anonymize).

### 10.4 Reporting & moderation

* Single report on comment (1 unique reporter) triggers `under_review`.
* Reports auto-deleted if the comment is deleted.

---

## 11. Reporting & moderation (full rules & UI behavior)

### 11.1 Reporting primitives

* Actions allowed: report brief, report project, report comment.
* Report structure:

  * Reporter: `reporter_username` if logged in; else `reporter_device_id`.
  * One report per target per reporter (uniqueness).
  * Reasons are selected from the fixed reason list (see Reports section).
  * Optional `details` field allows explanation.

### 11.2 Thresholds & queueing

* Comments: 1 report → `under_review` → appears in moderation queue immediately.
* Projects & Briefs: require ≥ 2 distinct reports to appear in moderation queue (prevents spam/targeted single-report abuse).
* Moderation queue items display: reports_count, list of reporters (user_id or device_id), reasons, details, timestamps, and evidence (captured logs like IP/UA if available).

### 11.3 Moderator actions & consequences

* **Comment**

  * Pass: No action.
  * Remove: Delete comment (apply deletion semantics).
  * Suspend commenter: suspend account (mod decides duration).
* **Project**

  * Pass: No action.
  * Delete permanently: remove project and all related data (views, upvotes, comments, reports).
* **Brief**

  * Pass: keep public.
  * Unlist: set brief to `unlisted`, remove from galleries and saved lists; leave brief in DB.
* All moderator actions logged in `moderation_actions` audit trail (without recording which moderator performed action if you prefer; but record action happened with timestamp).

### 11.4 Appeals & notifications

* If content is deleted/unlisted, platform sends an email with the reason and link for appeal.
* Appeals must be reviewed by Admins only (not Moderators).
* If appeal succeeds, content is restored and user notified.

### 11.5 Suspicious Activity

* Events like rapid upvotes, view spikes, mass signups from same IP, and repeated reports are flagged in `fraud_events`.
* Suspicious accounts appear in the "Suspicious Activity" moderator panel.
* Auto-suspension allowed for egregious activity but limited to **48 hours max** (after which manual review required).

---

## 12. Token system & quotas

### 12.1 Daily token rules (explicit)

* Reset at 00:00 UTC daily.
* Tokens do **not** stack (no carry-over).
* Token balances:

  * Free / Unpaid: 30 tokens/day.
  * Paid: 150 tokens/day.
* Costs:

  * New brief generation: 10 tokens.
  * Random pre-generated brief: 1 token.

**Implementation notes for UI**:

* UI must show tokens remaining and next reset time (00:00 UTC).
* If insufficient tokens, show exact message: “Insufficient tokens. New brief generation costs 10 tokens.”

### 12.2 Token usage patterns

* First token use for the day creates/initializes daily token record for the user/device.
* Token deduction must be atomic (transactional) with brief generation to avoid race conditions.

### 12.3 Edge cases

* If the AI API fails after token deduction, perform fallback with stored brief selection and still deduct tokens per policy.
* If AI call fails and no fallback exists, refund token and show error message: “AI service unavailable — try again later.” (Server returns error; ensure client shows friendly message.)

---

## 13. Exporting & formats (exact behavior)

### 13.1 Supported export formats

* `.txt` — plain text export (structured sections).
* `.md` — Markdown format preserving headings and bullet points.
* `image` — PNG snapshot of the brief (for visual sharing).
* `pdf` — PDF export. Implementation: render the PNG image and convert to PDF (server-side or client-side). This avoids expensive templating and enables consistent styling.

### 13.2 Quality & parity

* Both paid and free users receive the **same export quality and detailing** across formats.
* Both paid and free users receive the same watermark on exported assets (ensure watermark present).
* There are **no** user-branded exports or multiple themes in v1.

### 13.3 Implementation notes

* For PNG → PDF conversion, use a lightweight library or service that converts images to PDF.
* Ensure that exported PDFs contain the full brief content in a readable layout (brief_id, company_name, company_description, project_description, deadline, keywords).
* For image export, ensure consistent dimensions and DPI acceptable for printing.

### 13.4 UX

* Export modal lists formats (txt, md, image, pdf) with small explanation under each.
* Clicking export shows progress; on completion, show download link.
* If export fails, show exact message: “Export failed. Try again or contact support.”

---

## 14. Search, filters & discover behavior (detailed)

### 14.1 Filters & search fields

* Search-enabled filters:

  * Category (required to narrow)
  * Niche
  * Industry
  * Date ranges for Discover (This Week, Last Week, This Month, Last Month, This Year, Last Year)

* Search by ID:
  
  * For Discover Page :
    * Project ID → shows that exact project.
    * Brief ID → shows all projects linked to that brief (if brief is unlisted, projects will show brief overview but **do not** reveal the brief_id).

  * For Brief Gallery :
    * Brief ID → shows that exact brief

### 14.2 Discover sort options

* Newest
* Most Viewed
* Most Upvoted
* Trending (7-day window; see section 15 for trending logic)

### 14.3 Filters behavior

* Filters are combined using AND semantics (category AND niche AND industry).
* For Brief Gallery : If filters result in insufficient items within the rolling window, apply fallback to older briefs that matches filters (respecting uniqueness and no-duplicate across results).

---

## 15. Leaderboards & trending (detailed)

### 15.1 Leaderboard mechanics

* Projects uploaded by paid users automatically participate.
* Filters: All, Category, Niche, Industry.
* Sorting windows: Weekly, Monthly, Yearly, All-time.
* Metrics: Most Viewed, Most Upvoted.
* Default state on loading Leaderboards:

  * No filters selected, Sorting window = All-time, Metric = Most Viewed.
* Rankings recomputed hourly (on the hour) with server cron.

### 15.2 Project view rank display rules (by age)

* If `age <= 1 week`:

  * Display project ranks for Weekly, Monthly, Yearly, All-time.
  * Show option to view ranks using either metric (Most Viewed OR Most Upvoted) — user selects one metric at a time.
* If `1 week < age <= 1 month`:

  * Display ranks for Monthly, Yearly, All-time.
  * Option to view ranks with either metric (one at a time).
* If `1 month < age <= 1 year`:

  * Display ranks for Yearly and All-time.
  * Show rank numbers for both metrics (Most Viewed and Most Upvoted) simultaneously.
* If `age > 1 year`:

  * Display only All-time ranks.
  * Show both metrics’ ranks simultaneously.

### 15.3 Trending logic

* Window: 7 days (last 7 days vs previous 7 days).
* Minimum threshold: 20 views to be considered.
* Formula: `percent_increase = ((views_last_7_days - views_previous_7_days) / max(views_previous_7_days, 1)) * 100`.
* Exclude suspicious views/upvotes flagged by fraud detectors from the counts used for ranking (validation step). Raw counts on project page remain unchanged, but ranking uses validated counts.

---

## 16. Badges & Milestones  
**Badges (awarded dynamically):**  
  * “Top Writer of the Month”  
  * “Most Viewed Designer”  
  * “Most Liked Animator”  
  * “Rising Creator”  
  * “Consistent Performer”
  * etc.
**Milestones:**  
  * Based on: number of briefs generated, projects submitted, upvotes received, or leaderboard ranks  
  * Unlockable achievements visible on profile  

---

## 17. Navigation & UI specifics (exact layouts/messages)

### 17.1 UI Design and UX

17.1.1 Emotional Tone

The design language of NikharaBrief should create an emotional atmosphere that feels:
* Creative – It should inspire users to create, explore, and express ideas freely.
* Authentic – The design must feel genuine, not overly polished or artificial.
* Premium – It should look professional and high-quality without being intimidating or luxury-focused.
* Calmly Energetic – The UI should feel active and inspiring, but not flashy or visually noisy.
This emotional tone should be maintained consistently across all pages, elements, and interactions — from the landing page to dashboards and even modals.

17.1.2 Color System

Dark Mode (Default Theme) :
* Primary Background: Deep Charcoal Blue (#0E141B) — Richer than black, helps keep focus on content.
* Secondary Background (cards, panels): Midnight Gray (#1C232C) — Provides depth and balance.
* Primary Accent: Sapphire Blue (#2E8BFF) — Fresh and creative; used for buttons, active icons, and links.
* Secondary Accent: Golden Amber (#FFB84D) — Used for Pro labels, upgrade prompts, and premium highlights.
* Highlight / Success: Emerald (#3DDC97) — Used for confirmations, success messages, and completion indicators.
* Error / Warning: Coral Red (#FF5C5C) — Used for alerts, errors, and destructive actions.
* Text Primary: Off-White (#E9EDF2) — Smooth, high-contrast text color for titles and main content.
* Text Secondary: Muted Gray (#A0A8B0) — For secondary content, placeholders, and descriptions.
* Border / Divider: Graphite (#2A313A) — Used to separate sections softly without harsh contrast.

Light Mode :
* Primary Background: Cloud White (#F5F7FA) — Clean, soft white for calm readability.
* Secondary Background: Pure White (#FFFFFF) — Used for cards and floating panels.
* Primary Accent: Sky Blue (#1A73E8) — Bright and professional; same tone as in Google’s Material palette.
* Secondary Accent: Warm Amber (#FFC045) — Used for highlights and premium features.
* Text Primary: Deep Charcoal (#1B1F24) — Maintains strong readability and contrast on light backgrounds.
* Text Secondary: Steel Gray (#5E6671) — For less important content and helper text.
* Border / Divider: Mist Gray (#D3D7DD) — Subtle separators to avoid clutter.

17.1.3 Design Philosophy (Figma + Framer Hybrid)

* Flat + Glassy Depth Hybrid: Avoid heavy gradients and solid layers. Use semi-transparent cards with blur and soft ambient shadows to achieve depth and elegance without clutter.

* Motion and Animation: Motion should feel natural and purposeful. Use smooth easing — Framer-style spring animations (around 200–300 ms) for hover, load, and modal transitions. Use smooth scroll animation for all pages and sections.

* Typography:
  * Headlines → Inter SemiBold (700)
  * Body text → Inter Regular (400)
  * Subtext and secondary labels → Inter Medium (500)
  The typography system should focus on clean readability with consistent spacing and contrast across the app.

* Shapes and Corners: Rounded corners with an “XL” radius (~1 rem). This gives a friendly, modern, and balanced appearance without compromising on professional tone.

* Buttons and CTAs:
  * Use glowing hover states for interactive buttons (e.g., a soft blue glow under hover).
  * Maintain clear hierarchy: solid accent buttons for primary actions, bordered or ghost buttons for secondary.

* Visual Personality: The UI should feel like a fusion between Notion’s calm minimalism and Midjourney’s artistic professionalism — clean yet expressive, simple yet inspiring.

17.1.4 UX and Interaction Guidelines

* Navigation: The layout should remain intuitive — clear side navigation on larger screens and collapsible menu on mobile.
* Feedback: Use micro-interactions like subtle button animations, hover color shifts, and smooth scroll feedback.
* Accessibility: Maintain adequate contrast ratios, keyboard navigation support, and readable text spacing.
* Consistency: Every modal, card, and hover state should follow a unified motion and shadow system.
* Responsiveness: Layouts should scale seamlessly between desktop, tablet, and mobile views, preserving structure and hierarchy.

### 17.2 Sidebar (Left) — default expanded

From top-to-bottom:

* Sidebar toggle icon (top-right corner of sidebar when expanded; clicking it collapses the sidebar).
* Home (Brief Generator)
* Brief Gallery
* Discover
* Leaderboards
* Saved Briefs
* Profile (at bottom, above settings)
* Settings (at bottom with Dark/Light mode toggle on its right side within the sidebar)
* When collapsed, clicking the toggle expands again; default state: expanded on first visit.

### 17.3 Top UI behaviors

* Dark Mode default.
* Buttons follow primary accent color patterns.
* Cards for briefs/projects consistent dimensions; leaderboard cards are wider and less tall than gallery cards.

### 17.4 Card layouts (exact)

**Brief card**:

* Heading: Company/Client Name (top).
* Company description (below heading; truncated with fade).
* Category / Niche / Industry (bottom-left).
* Click opens the full brief view.

**Project card**:

* Heading (top).
* Company description (below heading; truncated).
* Category / Niche / Industry (above byline).
* Byline: `by @username` (bottom-left).
* Stats: views & upvotes (bottom-right).
* Click opens full project page.

**Leaderboard card**:

* Rank number (left)
* Heading
* Byline: `by @username` (bottom-left)
* Views & Upvotes (bottom-right)
* Category / Niche / Industry (above byline)

### 17.5 UX messages (exact text)

* Login page banner: “Do not use temporary or disposable emails. You may lose access to this account.”
* Username notice near signup: “Your username will be permanent and cannot be changed while this account exists.”
* Temporary email warning remains visible on login/signup flows.
* Locked feature message display for premium features (for free/unpaid users):

  * Title: “This is a paid feature”
  * Body: “Upgrade to Pro Plan to unlock. [short bullet list of benefits for this feature]”
  * CTA: “Upgrade to Pro”
* Token insufficient: “Insufficient tokens. New brief generation costs 10 tokens.”
* Export error: “Export failed. Try again or contact support.”
* Project delete message: “The project you are trying to access does not exist or has been removed.”
* Moderation emails:

  * Project deleted: “Your project '[heading]' was deleted for [reason]. This action is irreversible.”
  * Brief unlisted: “Your brief '[company_name]' was marked unlisted due to [reason]. It is not visible in results; contact support if you think this is an error.”
  * Comment deleted: “Your comment on project '[project heading]' was removed for violating our community guidelines.”
  * Suspension email: “Your account has been temporarily suspended for [x hours]. Reason: [reason].”
* Password reset confirmation message: “Password successfully changed.”

### 17.6 Footer layout (4 columns + bottom bar)

Top area (four columns) — keeps it tidy and scannable.

* Column 1 (Left side) — Brand & short blurb

  * Logo (medium size, left).
  * Short single-sentence: “Unleash Your Creativity”

* Column 2 — Links

  * Upgrade to Pro
  * Discover

* Column 3 — Details

  * About
  * Contact
  * Terms & Conditions (Point 29)
  * Privacy Policy (Point 30)

* Column 4 — Social

  * LinkedIn
  * Youtube
  * Instagram
  * Facebook
  * X (Twitter)
  * Threads
  * Pinterest

* Bottom bar (single row, centered)

  * © 2025 — NikharaBrief™. All Rights Reserved.
  * Made with ❤ by Ayudha Studios

---

## 18. Payments, Cashfree and Paypal flow & billing messages (detailed)

### 18.1 Cashfree and Paypal integration flow (explicit)

* Payment flow:

  1. User clicks upgrade, and opens Cashfree or Paypal Checkout (hosted).
  2. On Success, Backend creates/updates user with `payment = "paid"`.
  3. Redirect user to profile setup.
* Webhook events to handle:

  * `checkout.session.completed` — mark user paid; create account if necessary.
  * `invoice.payment_failed` — mark `payment = "unpaid"`.
  * `customer.subscription.deleted` — mark `payment = "unpaid"`.
  * `invoice.paid` — adjust subscription period/confirmation.
* Subscriptions: support monthly and yearly plans (prices set in Cashfree/Paypal products).

### 18.2 Billing messages & states (exact)

* Payment failed shown as: “Payment Failed.”
* Subscription expired shown as: “Your subscription has expired. Renew to regain benefits.”
* Billing page: “Manage subscription” link uses Cashfree/Paypal Customer Portal if enabled.

### 18.3 Refund & chargeback policy

* Platform defers to Cashfree's / Paypal’s refund system and policy.
* Account deletion does not automatically issue refunds; any refunds must go via Cashfree/Paypal following company policy.

---

## 19. Password resets, login, and account deletion (detailed)

### 19.1 Login & verification

* Two modes supported:

  * Password-based login (email + password).
  * Magic link (email) login (optional).
* Must verify email for account access; require email verification upon account creation and before enabling paid-only actions.
* On login, present the disposable email warning if email domain is disposable (soft warning, not blocking).

### 19.2 Password reset flow (exact)

* Request:

  * User enters email.
  * Server creates single-use cryptographically random token (store hashed) with expiry of 15 minutes.
  * Send email with reset link: `https://domain/reset-password?token=...`.
  * Throttle: max 3 requests per hour per account.
* Reset:

  * User clicks link, server verifies token and expiry.
  * User enters new password.
  * Server replaces old password hash, invalidates token (set used).
  * Show post-reset page: “Password successfully changed.”
* Security:

  * Log suspicious mass resets from same IP and trigger CAPTCHA, flag `moderation_notes`.

### 19.3 Account deletion (explicit)

* Preconditions:

  * User must have `payment = "unpaid"`.
  * User must explicitly cancel subscription via Billing page before deletion.
* Procedure:

  1. User navigates to delete account page.
  2. Require user to type exactly: `Delete @username` in a text box.
  3. Show final confirmation modal describing irreversible effects.
  4. On confirm, server performs:

     * Delete Users row (freeing username and email for reuse).
     * Delete saved_briefs entries and brief_history for that user.
     * Anonymize projects and comments uploaded or authored by the user: set `uploader_username = NULL`, `uploader_name = "[deleted user]"`; comments set `commenter_username = NULL` but comment content retained (unless user explicitly requests full deletion, which is not the default).
  5. No grace period by default; final.

---

## 20. Security, link validation & safe browsing

### 20.1 Password storage & tokens

* Passwords stored hashed with a secure algorithm (bcrypt/argon2).
* Password reset tokens hashed before storage.
* Session management must support logout and token revocation.

### 20.2 Link validation (external links)

* On project upload:

  * Reject non-HTTPS URLs.
  * Reject URL shorteners or suspicious domains by pattern matching.
  * Perform HTTP HEAD check — require `200 OK` response for submission.
  * Run Google Safe Browsing check — if flagged, reject upload.
  * No metadata extraction for external content.

### 20.3 Anti-abuse & CAPTCHAs

* No initial signup rate limits or CAPTCHAs by default (per your decision).
* Trigger CAPTCHA only after suspicious patterns:

  * Many password resets per IP.
  * Rapid generation bursts beyond thresholds.
  * Suspicious upvote/view spikes.
* Suspicious behavior recorded in `moderation_notes`.

### 20.4 Role-based access & admin security

* Use RBAC to enforce moderator/admin-only actions.
* Logging: store moderation actions in audit logs without recording moderator identity (per your request), but maintain timestamp and action type to support analytics (if later required, store moderator identity optionally).

---

## 21. Analytics & monitoring

### 21.1 Tools

* Google Analytics 4 for sessions, custom events (brief_generated, export_done, project_uploaded).
* Google Search Console for SEO and indexing monitoring.
* Microsoft Clarity optional for heatmaps/session recording when needed.

### 21.2 Events to track (recommended set)

* `brief_generated` — with metadata: generation_mode (new|pre), category, niche, industry, user_type.
* `brief_saved` — user saved brief.
* `brief_exported` — include `format` (txt|md|image|pdf).
* `project_uploaded` — include whether linked to brief or manual.
* `upvote_given`
* `view_recorded`
* `comment_added`
* `report_submitted` — include target type and reason.
* `payment_success`
* `payment_failed`
* `user_deleted`
* Keep event payloads small and non-identifying when possible (GA4 handles PII restrictions).

### 21.3 Metrics & KPIs

Track from day one:

* MAU / DAU
* Briefs generated per day
* Saved briefs count and exported briefs count
* Paid conversions & churn
* Avg cost per generation (API cost, track via internal metric)
* API quota usage and moderation flags
* Errors (generation failures, upload failures)

---

## 22. Scheduled jobs, cron tasks & housekeeping

### 22.1 Daily @ 00:00 UTC

* Reset daily tokens for users/devices for current date (or create on demand per first use).
* Purge anonymous `views` older than 6 months (do not decrement project counts).
* Any daily housekeeping tasks (log rotation etc.).

### 22.2 Hourly @ HH:00 UTC

* Recompute leaderboards ranks for weekly/monthly/yearly/all-time and both metrics.
* Recompute trending scores (7-day windows).
* Run lightweight anomaly detection for view/upvote spikes and insert `fraud_events`.

### 22.3 Every 3 days

* Compute rolling windows for brief gallery (72 hours) and optionally pre-cache gallery pages.

### 22.4 On brief unlist event (immediate)

* Remove saved_briefs referencing unlisted brief via background job.
* Notify owner (if desired).

### 22.5 On project delete (immediate)

* Cascade delete views, upvotes, comments, comment_reports, project_reports.

---

## 23. Moderation UI and workflows (detailed)

### 23.1 Moderator sidebars & tabs

Available to moderators (and admins with more privileges):

* **Moderation Queue**: items sorted by reports_count desc; filters by type (comment/project/brief).
* **Brief Moderation**: list of briefs flagged or under review; actions: pass/unlist.
* **Project Moderation**: flagged projects; actions: pass/delete; includes button to email uploader.
* **Comment Moderation**: flagged comments; actions: pass/delete.
* **Suspicious Activity**: list of flagged users with history and `moderation_notes`.
* **Reports Tab in User Profile**: shows all reports related to that user's content (comment & project reports).

### 23.2 Moderator operations (explicit)

* Inspect item history (report reasons, reporter identities).
* Decide action:

  * Pass — mark reports as resolved.
  * Delete (project) — permanently delete project and cascade.
  * Unlist (brief) — change `brief_visibility` to `unlisted` and remove saved_briefs.
  * Delete comment — set is_deleted = true and anonymize credentials.
  * Suspend user — set `suspended_until` to chosen timestamp (max 48h for auto-suspension; moderators can set custom durations for manual suspensions).
* Actions recorded in audit logs as a record that action occurred; your choice: do not store moderator identity.

### 23.3 Moderator workflows for appeals

* User appeals go to Admin inbox.
* Admin can restore items or uphold deletion.
* Notify user of outcome via email.

---

## 24. Data retention policies & auto-cleanup rules

### 24.1 Views & upvotes

* Anonymous view records deleted after 6 months of inactivity; project counts unaffected.
* Upvotes: if project deleted, upvotes are removed.
* For paid users, view/upvote data retained indefinitely.

### 24.2 Reports

* Auto-delete report rows when referenced item (project/comment) is deleted.
* For brief unlist, decide whether to keep brief_reports for audit or auto-delete; final rule: keep brief_reports for audit (moderation trace) but if brief is unlisted you may optionally leave or delete reports — product decision; current spec: keep brief_reports for audits.

### 24.3 User deletion

* Delete users row, free username/email for reuse.
* Delete saved_briefs and brief_history entries.
* Anonymize projects/comments (uploader_username = NULL, uploader_name = "[deleted user]"; commenter_username = NULL; comments remain).
* No soft-delete retention for personal profile data post deletion (unless legal hold required).

---

## 25. Error handling, messages & email notifications

### 25.1 Error UX messages (explicit)

* Token insufficient: “Insufficient tokens. New brief generation costs 10 tokens.”
* AI generation failure: “AI service temporarily unavailable. Your token has been refunded. Try again later.” (Refund occurs only if fallback unavailable.)
* Invalid link uploads: “External link invalid: must be HTTPS, not a shortener, and must return 200 OK.”
* Report submission duplicate: “You have already reported this item.”
* Password reset limit exceeded: “Too many password reset requests. Try again later.”

### 25.2 Email templates (key flows)

* Verify Email — initial email with verification link for account activation.
* Password Reset — token link (15 min expiry).
* Project Deleted — subject: “Your project '[heading]' has been removed.” Body includes reason and irreversibility notice.
* Brief Unlisted — subject: "Your brief '[company_name]' has been unlisted"; body contains reason and instructions for appeal.
* Suspension Email — subject includes suspension length and reason.
* Account Deletion Confirmation — optionally notify of deletion.

---

## 26. Admin, moderator capabilities & exemptions

* Admins: manage subscriptions, view billing data on Cashfree/Paypal dashboard, promote/demote moderators, create normal user profiles that are payment exempt (bypass payment field restrictions), edit lists (Categories, Niches, Industry, Keywords), manage ad zones, and access moderation panels.
* Moderators: manage content (brief/project/comment moderation), flag suspicious users, suspend users, perform deletions/unlisting.
* Moderators & Admins bypass `payment` field restrictions (full access without subscribing).
* Moderator identity is not stored for moderation action logs if you prefer anonymity; audit logs will contain actions and timestamps but not moderator names by default.

---

## 27. Edge cases, consistency rules & conflicts resolved

* **Unlisted brief linked project**: project displays brief overview but not brief_id in front-end DOM; server ensures brief_id obfuscation.
* **Duplicate company names**: disallowed when creating new brief; UI validates uniqueness.
* **Token & AI failure**: if token deducted and AI fails and fallback not found — refund token and show error.
* **Reports threshold**: comments under_review on 1 report; projects/briefs under_review on 2 distinct reports — this prevents vandalism by single reporter.
* **View record expiry**: anonymous view deletion doesn't change `projects.views_count`.
* **Account deletion**: only allowed if user is unpaid and has explicitly cancelled subscription; requires typing `Delete @username` — no grace period.

---

## 28. Appendix: exact UI strings & sample flows

### 28.1 Login / Signup UI texts

* Login page banner: “Do not use temporary or disposable emails. You may lose access to this account.”
* Signup page note (near username input): “Your username will be permanent and cannot be changed while this account exists." The user does not need to type ‘@’ in username, '@' should be automatically added before the username entered by the user, and the UI should show an "@" (which is not deletable, it is fixed) on the left side of username input textbox, this will help the user to know that '@' is already added.
* Disposable email tooltip: “Using a disposable email may prevent password recovery or permanent access. Use a real, stable email address.”

### 28.2 Brief generator UI strings

* Button: “Generate New Brief — 10 tokens”.
* Button: “Get Pre-Generated Brief — 1 token”. On hover give a floating textbox that says, "These briefs may have already been used."
* Tooltip for tokens: “Tokens reset daily at 00:00 UTC. Tokens do not accumulate.”

### 28.3 Save / export UI

* Save brief button on top-right of the generated brief (paid only): “Save” 
* Save confirmation message: “Brief saved.”
* Save blocked message (free/unpaid): “This is a paid feature — Upgrade to Pro to save briefs.”
* Export button on top-right of the generated brief (beside Save Brief Button) : "Export"

### 28.4 Moderation & reporting UI

* Report dialog title: “Report”
* Report reasons list (exact strings): Sexual, Violent/Repulsive, Abusive/Harassment, Dangerous Acts, Misinformation, Spam/Misleading, Promotion, Copyright Violation, Malware/Security Risk, Sensitive Brand/Trademark
* Report confirmation: “Thank you. We will review your report soon.”
* Moderation queue label: “Under Review”

### 28.5 Project deletion message

* For users: email subject: “Your project ‘[heading]’ has been removed”
* For visitors to deleted project URL: “The project you are trying to access does not exist or has been removed.”

---


### 29. 📜 Terms and Conditions for NikharaBrief™

**Last updated:** October 2025
**Operated by:** *Ayudha Studios*
**Contact:** [nikharabriefmanager@gmail.com](mailto:nikharabriefmanager@gmail.com)


## 1. Introduction

Welcome to **NikharaBrief™**, a creative platform developed and owned by **Ayudha Studios**.
By using our website, located at [https://nikharabrief.com](#), you agree to these Terms and Conditions (“Terms”).
If you do not agree with any part of these Terms, please stop using our website immediately.

Minors under **13 years of age** are not permitted to use this Website.


## 2. Intellectual Property Rights

Unless otherwise stated, all the content on **NikharaBrief™** — including AI-generated briefs, design, text, and software — are the exclusive property of **Ayudha Studios**.
Users retain ownership of projects they upload but grant NikharaBrief™ a **non-exclusive, worldwide license** to display and promote that content on the platform.

You are granted limited access solely to view and interact with the content and features available on the website.


## 3. User Accounts and Access

There are three user types:

* **Free Users (Anonymous)** – can view public briefs and projects but cannot upload, comment, or save.
* **Paid Users** – can access all features including saving briefs, uploading projects, commenting, replying, and managing visibility of their generated briefs (public/unlisted).
* **Unpaid Users** – users whose paid subscription has expired or payment failed; can access saved briefs and past projects but cannot create or save new ones.

Usernames (starting with “@”) are **permanent** once registered. Display names can be changed anytime.
You must not use disposable or fake email addresses, as this may lead to account inaccessibility.


## 4. Subscriptions, Payments, and Refunds

Payments are securely processed via **Cashfree or Paypal**.
All subscriptions renew automatically unless cancelled before the next billing cycle.

If payment fails or subscription expires, the account becomes “unpaid”:

* Access to previously saved briefs and uploaded projects is retained.
* Access to premium actions like saving new briefs, uploading new projects, or commenting is suspended.

No refunds are provided after a successful payment.
If payment fails, users see “**Payment Failed**”; if subscription expires, they are required to renew their subscription to regain benefits.


## 5. Restrictions

You are specifically restricted from:

* Republishing or redistributing website material without permission.
* Selling or sublicensing the content present on NikharaBrief™.
* Using the website for unlawful or harmful purposes.
* Attempting to reverse-engineer, mine, or extract database content.
* Misusing the AI brief generator for spam or offensive outputs.
* Interfering with access to the website or other users’ experiences.


## 6. Your Content

“Your Content” means any text, image, link, or file you upload or post.
By posting Your Content, you grant **Ayudha Studios** a non-exclusive license to use, display, and distribute it on NikharaBrief™ for showcasing or leaderboard purposes.

You are responsible for ensuring that:

* The content belongs to you and doesn’t violate third-party rights.
* Uploaded projects do not include malicious links or executable files.
* Any reported or moderated project may be permanently removed without prior notice.


## 7. AI-Generated Briefs

All AI-generated briefs are **fictional** and meant for creative or educational purposes only.
Any resemblance to actual companies or entities is coincidental.
NikharaBrief™ is not responsible for any outcomes based on AI-generated content.


## 8. Community and Moderation

* Only paid users can comment, reply, or upload projects.
* All users (including free) can view, upvote, and report projects or comments.
* Reports are limited to **one report per user (or device) per item**.
* Moderation is manual; no content is auto-hidden.
* Deleted comments retain reply chains, but deleted text is replaced with “Deleted.”
* Moderated briefs become **unlisted** and are removed from saved lists automatically.


## 9. Account Deletion

To delete your account, you must not have an active subscription.
Deletion effects:

* Personal data and profile is removed permanently.
* Projects remain visible but anonymized (“[deleted user]”).
* No recovery or refunds possible after confirmation.


## 10. Limitation of Liability

**Ayudha Studios** and **NikharaBrief™** are not liable for:

* Any losses or damages caused by using the website.
* Inaccuracies in AI-generated content.
* Third-party links, advertisements, or integrations (e.g., Google, Cashfree, Paypal).

Use of NikharaBrief™ is entirely at your own risk.


## 11. Indemnification

You agree to indemnify and hold **Ayudha Studios** harmless from any claims, damages, or expenses arising from your breach of these Terms or misuse of the platform.


## 12. Variation of Terms

We reserve the right to revise these Terms anytime.
Updates become effective once published. Continued use indicates acceptance.
The latest version will always be available at **[https://nikharabrief.com/terms](https://nikharabrief.com/terms)**.


## 13. Contact

📧 **[nikharabriefmanager@gmail.com](mailto:nikharabriefmanager@gmail.com)**

---

### 30. 🔒 Privacy Policy for NikharaBrief™

**Last updated:** October 2025
**Operated by:** *Ayudha Studios*
**Contact:** [nikharabriefmanager@gmail.com](mailto:nikharabriefmanager@gmail.com)


## 1. Information We Collect

* **Account Data:** email, username, display name, payment status.
* **Analytics Data:** device type, region, time spent, pages visited (via Google Analytics 4 and Search Console).
* **Usage Data:** AI brief generation inputs, selected categories/niches, and search terms.
* **Community Data:** uploaded projects, upvotes, reports, and comments.
* **Payment Data:** handled by Cashfree and Paypal; NikharaBrief™ does not store payment details.


## 2. How We Use the Information

We use data to:

* Deliver and improve services.
* Manage tokens and generation limits.
* Process payments and verify users.
* Detect abuse, spam, or suspicious activity.
* Display community and leaderboard metrics.
* Communicate necessary updates or support responses.


## 3. Cookies

We use cookies to:

* Keep you signed in.
* Track token usage and preferences.
* Collect non-personal analytics.

You can disable cookies in your browser anytime, but some features may stop working properly.


## 4. Data Retention

* Free user views/upvotes/reports auto-delete after **6 months**.
* Paid users’ view and upvote data do not expire.
* Deleted accounts have all personal data removed; anonymized projects remain.
* Moderated briefs remain unlisted but are retained internally.


## 5. Data Sharing and Safety

We do **not sell or rent data**.
We share limited information with trusted third parties:

* **Cashfree and Paypal** for payments
* **Google Analytics & GSC** for performance data

All connections are encrypted (HTTPS). AI and moderation filters are automated but reviewed by humans when flagged.


## 6. Children’s Information

NikharaBrief™ does not knowingly collect personal data from users under **13 years old**.
If you believe a child has provided such data, contact us immediately for account and data removal.


## 7. Updates to This Policy

This Privacy Policy may be updated from time to time.
The latest version will always be available at **[https://nikharabrief.com/privacypolicy](https://nikharabrief.com/privacypolicy)**.


## 8. Consent

By using NikharaBrief™, you hereby consent to this Privacy Policy and agree to its terms.

---
