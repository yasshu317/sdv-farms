# SDV Farms — Product Overview & Feedback Request

**Prepared for:** Client Review
**Prepared by:** SDV Farms Development Team
**Date:** March 2026
**Live URL:** https://sdv-farms.vercel.app
**Version:** Phase 1 + Phase 2 (Marketplace)

---

> **How to give feedback:** At the end of this document there is a [Feedback Checklist](#feedback-checklist). Go through each section, visit the live links, and fill in your comments. You can reply to this document or share your notes in a call.

---

## What We Built

SDV Farms is a **two-sided agricultural land marketplace** for the Telangana, Andhra Pradesh, and Karnataka markets. It connects farmers/agents who want to sell agricultural land with buyers/investors looking to purchase.

The platform is:
- **Bilingual** — English and Telugu, toggleable on every page
- **Mobile-first** — works on phone browsers and can be installed as an app (PWA)
- **Free-tier** — hosted on Vercel, database on Supabase, no monthly server costs

---

## User Journeys

### 1. 🏡 Buyer Journey

> *"I want to browse agricultural land in Telangana and book a site visit."*

| Step | What happens | Live link |
|------|-------------|-----------|
| 1. Lands on home page | Sees hero, AI chatbot, Phase 1 plot info | [/ (Home)](https://sdv-farms.vercel.app/) |
| 2. Clicks "Properties" in navbar | Browses all approved listings with filters | [/properties](https://sdv-farms.vercel.app/properties) |
| 3. Filters by State / Soil type / Area / Price | Listings update instantly | [/properties](https://sdv-farms.vercel.app/properties) |
| 4. Clicks a property card | Sees full detail — photos, acreage, soil type, road access, price | [/properties/{id}](https://sdv-farms.vercel.app/properties) |
| 5. Clicks "Book a Site Visit" | Picks date + time slot (1-hr slots, 2-hr lead time) | Appointment picker on detail page |
| 6. Receives confirmation email | Auto-sent by Resend with date/slot/property details | — |
| 7. Can't find what they need | Submits a land requirement form | [/buyer-request](https://sdv-farms.vercel.app/buyer-request) |
| 8. Registers as buyer | Optional — unlocks wishlist (save up to 2 properties) | [/auth/register](https://sdv-farms.vercel.app/auth/register) |
| 9. Views saved properties | Buyer dashboard | [/dashboard](https://sdv-farms.vercel.app/dashboard) |

---

### 2. 🌾 Seller Journey

> *"I'm a farmer with 5 acres in Nalgonda. I want to list it for sale."*

| Step | What happens | Live link |
|------|-------------|-----------|
| 1. Clicks "Register" | Chooses "Sell Land" | [/auth/register](https://sdv-farms.vercel.app/auth/register) |
| 2. Eligibility check | Selects land type — Government/Poramboke/Forest blocked with clear message | Register page Step 2 |
| 3. Farmer or Agent? | Selects sub-type | Register page Step 2 |
| 4. Creates account | Standard email + password signup | Register page Step 3 |
| 5. Clicks "Post Property" | 3-step form: Location → Land Details → Documents | [/seller/property/new](https://sdv-farms.vercel.app/seller/property/new) |
| 6. Step 1 — Location | State → District → Mandal → Village (cascading dropdowns) | Form Step 1 |
| 7. Step 2 — Land details | Land type, soil type, document type, area, price/acre, road access | Form Step 2 |
| 8. Step 3 — Upload docs | Pahani / Adangal / RTC photos (PDF or image, max 10MB) | Form Step 3 |
| 9. Submitted for review | Status shows "Pending Review" in dashboard | [/seller](https://sdv-farms.vercel.app/seller) |
| 10. Admin approves | Property goes live; seller receives email; Property ID assigned (SDV-2025-001) | — |
| 11. Tracks performance | Views count, enquiry count, appointment list | [/seller](https://sdv-farms.vercel.app/seller) |
| 12. Books a call | Seller can also book a call with SDV Farms team | Seller dashboard |

---

### 3. 🛡️ Admin Journey

> *"I need to review submitted properties and manage all bookings."*

| Step | What happens | Live link |
|------|-------------|-----------|
| 1. Logs in as admin | Redirected to admin panel automatically | [/admin](https://sdv-farms.vercel.app/admin) |
| 2. Enquiries tab | All lead enquiries from Phase 1 form — update status (pending → contacted → visited → booked → closed) | Admin → Enquiries |
| 3. Buyers tab | All registered buyers | Admin → Buyers |
| 4. Plots tab | Phase 1 plot inventory — available / reserved / sold | Admin → Plots |
| 5. **Properties tab** ⭐ | Review seller submissions → **Approve** (auto-assigns SDV-YYYY-NNN ID) or **Reject** | Admin → Properties |
| 6. **Appointments tab** ⭐ | All booked site visits → confirm / cancel | Admin → Appointments |
| 7. **Requests tab** ⭐ | Buyer land requests → mark open / matched / closed | Admin → Requests |

---

### 4. 🔧 Services Journey

> *"I bought land. What other services can SDV Farms offer me?"*

| Step | What happens | Live link |
|------|-------------|-----------|
| 1. Clicks "Services" in navbar | Sees Phase II one-time services | [/services](https://sdv-farms.vercel.app/services) |
| 2. Browses 5 services | Fencing, Borewell & Electricity, Drip Irrigation, Farming Plan, Quality Plants | Services page |
| 3. Clicks "Book Enquiry" | Goes to contact section on home page | — |
| 4. Sees Phase III teaser | Future services — Security, Farmhouse, Crop Maintenance, Marketing | Services page (bottom) |
| 5. "Notify me" for Phase III | Enters email to be notified when Phase III launches | Services page |

---

## Features Summary

### Phase 1 (Live)
- ✅ Bilingual home page (English / Telugu)
- ✅ Hero section with agricultural illustrations
- ✅ Enquiry form → Supabase + Resend email
- ✅ Chat widget — instant FAQ answers + quick question buttons (no external AI)
- ✅ WhatsApp quick-chat button
- ✅ Google Maps embedded
- ✅ Buyer registration + login
- ✅ Buyer dashboard
- ✅ Admin panel (leads, buyers, plots)
- ✅ Mobile PWA — installable on Android and iPhone

### Phase 2 (Built, Pending Review)
- ✅ Seller registration with eligibility check
- ✅ 3-step property listing form with document upload
- ✅ Public property browse page with advanced filters
- ✅ Property detail page with photo gallery
- ✅ Buyer wishlist (save up to 2 properties)
- ✅ Appointment booking — date + time slot with 2-hr lead time
- ✅ Auto email confirmations for appointments
- ✅ Buyer land request form (anonymous or logged in)
- ✅ Seller dashboard (listings, views, appointments)
- ✅ Admin Properties tab — approve listings, assign SDV IDs
- ✅ Admin Appointments + Requests tabs
- ✅ Services page — Phase II catalog + Phase III teaser

---

## Technical Summary (For Reference)

| Item | Details |
|------|---------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (free tier — PostgreSQL) |
| Authentication | Supabase Auth (email/password) |
| File Storage | Supabase Storage (free 1GB) |
| Email | Resend (free 100 emails/day) |
| Chat widget | Built-in FAQ + quick replies (no AI API cost) |
| Hosting | Vercel (free tier) |
| Monthly cost | **₹0** — all free tiers |
| Tests | 39 unit tests + 47 E2E browser tests |
| CI/CD | GitHub Actions — tests run before every deploy |

---

## What's NOT Yet Built (Future Phases)

| Feature | Phase | Notes |
|---------|-------|-------|
| OTP / mobile number verification | Phase 3 | Requires Twilio/MSG91 (paid service) |
| Document OCR / auto-verification | Phase 3 | Requires AI document API |
| Online payment / advance booking fee | Phase 3 | Requires Razorpay integration |
| Digital e-sign of agreements | Phase 3 | Requires Digio/Leegality |
| Physical security updates | Phase 3 | Listed as coming soon |
| Farmhouse planning service | Phase 3 | Listed as coming soon |
| Crop maintenance & marketing | Phase 3 | Listed as coming soon |
| Mobile native app (iOS/Android) | Future | Current PWA covers 90% of use cases |

---

## Pages Quick Reference

| Page | URL | Who sees it |
|------|-----|-------------|
| Home | `/` | Everyone |
| Browse Properties | `/properties` | Everyone |
| Property Detail | `/properties/{id}` | Everyone |
| Services | `/services` | Everyone |
| Buyer Land Request | `/buyer-request` | Everyone |
| Register | `/auth/register` | New users |
| Login | `/auth/login` | Returning users |
| Buyer Dashboard | `/dashboard` | Logged-in buyers |
| Seller Dashboard | `/seller` | Logged-in sellers |
| Post Property | `/seller/property/new` | Logged-in sellers |
| Admin Panel | `/admin` | Admin only |

---

## Feedback Checklist

Please go through each section below, visit the live links, and share your feedback.

---

### A. General / Design

| # | Question | Your Feedback |
|---|----------|---------------|
| 1 | Is the overall look and feel of the website appropriate for the target audience (farmers, investors)? | |
| 2 | Is the Telugu translation accurate and natural? (please check key pages — home, register, services) | |
| 3 | Are the colors and fonts easy to read on mobile? | |
| 4 | Is the navigation (Navbar) clear and easy to use? | |

---

### B. Buyer Experience

| # | Question | Your Feedback |
|---|----------|---------------|
| 5 | Is the property browse page ([/properties](https://sdv-farms.vercel.app/properties)) easy to use? | |
| 6 | Are the filter options (State, Soil Type, Area, Price) the right ones? Any missing filters? | |
| 7 | Is the property detail page clear? Is pricing information presented well? | |
| 8 | Is the appointment booking flow (date + time slot) easy to understand? | |
| 9 | Is the Buyer Land Request form ([/buyer-request](https://sdv-farms.vercel.app/buyer-request)) asking the right questions? | |
| 10 | Should the wishlist limit of 2 properties be increased? | |

---

### C. Seller Experience

| # | Question | Your Feedback |
|---|----------|---------------|
| 11 | Is the registration eligibility check (blocking Poramboke, Government land etc.) accurate? Any land types to add/remove? | |
| 12 | Is the 3-step property listing form asking all the right information? Any missing fields? | |
| 13 | Are the correct document types listed per state? (Telangana: Pahani/ROR-1B, AP: Adangal/1B, Karnataka: RTC) | |
| 14 | Is the seller dashboard showing the right information? | |
| 15 | Should sellers be allowed more than 2 active listings? | |

---

### D. Admin Panel

| # | Question | Your Feedback |
|---|----------|---------------|
| 16 | Is the admin property approval flow clear? (Approve → auto-assign SDV-YYYY-NNN ID) | |
| 17 | Are the appointment statuses (Pending / Confirmed / Cancelled) sufficient? | |
| 18 | Any additional information needed in the admin panel? | |

---

### E. Services Page

| # | Question | Your Feedback |
|---|----------|---------------|
| 19 | Are the Phase II service descriptions accurate? ([/services](https://sdv-farms.vercel.app/services)) | |
| 20 | Is the pricing for services shown anywhere, or should it be? | |
| 21 | Are the Phase III "coming soon" services the right ones to tease? | |

---

### F. Overall Priority & Next Steps

| # | Question | Your Feedback |
|---|----------|---------------|
| 22 | What is the single most important thing to fix or improve before launch? | |
| 23 | Which Phase 3 feature should be built first? | |
| 24 | Any features from your original requirement (XLS) that you feel are missing? | |
| 25 | Any other comments or suggestions? | |

---

*Thank you for your feedback. Once received, we will prioritise and plan the next sprint.*

*SDV Farms Development Team*
*Contact: [WhatsApp 7780312525](https://wa.me/917780312525)*
