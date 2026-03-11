# Requirements Document

## 1. Application Overview

- **Application Name:** DermAI UAE — AI-Driven Personalized Skin Analysis & Treatment Ecosystem
- **Description:** A web application tailored for the UAE market that leverages artificial intelligence to analyze users' skin conditions, deliver personalized skincare recommendations, connect users with certified dermatologists, and provide an integrated product/treatment marketplace — all within a single, cohesive digital ecosystem.
- **Reference File:** Software requirements document — file-agw4in7rfl6o.docx (https://miaoda-conversation-file.s3cdn.medo.dev/user-agw39he3ocg0/20260324/file-agw4in7rfl6o.docx)

---

## 2. Users & Use Cases

### 2.1 Target Users
- UAE residents seeking personalized skincare guidance
- Individuals with specific skin concerns (acne, hyperpigmentation, dryness, sensitivity, anti-aging, etc.)
- Dermatologists and licensed skincare professionals operating in the UAE
- Skincare product/clinic partners looking to reach targeted audiences

### 2.2 Core Use Cases
- A user uploads a facial photo or answers a skin questionnaire to receive an AI-generated skin analysis report
- A user receives a personalized skincare routine and product recommendations based on their analysis
- A user books a virtual or in-clinic consultation with a UAE-based dermatologist
- A dermatologist reviews AI analysis results and provides professional advice
- A user browses and purchases recommended skincare products from the integrated marketplace

---

## 3. Page Structure & Core Features

### 3.1 Page Overview

```
DermAI UAE
├── Landing Page
├── Authentication
│   ├── Sign Up
│   └── Sign In
├── User Dashboard
│   ├── Skin Profile
│   ├── Analysis History
│   └── My Routines
├── AI Skin Analysis
│   ├── Photo Upload / Questionnaire
│   └── Analysis Result Report
├── Personalized Recommendations
│   ├── Skincare Routine
│   └── Product Recommendations
├── Dermatologist Consultation
│   ├── Doctor Listing
│   ├── Booking
│   └── Consultation Room (Video/Chat)
├── Marketplace
│   ├── Product Listing
│   ├── Product Detail
│   └── Cart & Checkout
├── Dermatologist Portal
│   ├── Patient Queue
│   ├── AI Report Review
│   └── Prescription / Notes
└── Admin Panel
    ├── User Management
    ├── Doctor Management
    └── Product & Order Management
```

---

### 3.2 Landing Page
- Hero section introducing the platform's value proposition for UAE users
- Key feature highlights: AI skin analysis, expert consultations, personalized routines
- Call-to-action buttons: Start Free Analysis, Book a Dermatologist
- Testimonials section (UAE-based users)
- Partner clinics and brands logos
- Footer with UAE contact details, privacy policy, terms of service, and social media links

---

### 3.3 Authentication
- Sign Up: email + password, or OSS Google login
- Sign In: email + password, or OSS Google login
- Email verification on registration
- Password reset via email
- UAE phone number (optional) for SMS notifications
- Role selection at registration: End User or Dermatologist

---

### 3.4 User Dashboard

**Skin Profile**
- Displays current skin type, primary concerns, and last analysis date
- Editable personal details: age, gender, location (UAE emirate), known allergies, current medications

**Analysis History**
- Chronological list of all past AI skin analyses
- Each entry shows date, skin score, primary concerns identified, and a link to the full report

**My Routines**
- Active personalized morning and evening skincare routines
- Each step shows product name, usage instructions, and a re-order link

---

### 3.5 AI Skin Analysis

**Input Methods (user selects one or both)**

*Photo Upload*
- User uploads a clear frontal facial photo (JPG/PNG, max 10 MB)
- Real-time guidance overlay to ensure correct framing and lighting
- AI model processes the image and identifies: skin type (oily, dry, combination, sensitive, normal), concerns (acne, dark spots, wrinkles, redness, pores, uneven tone), and an overall skin health score (0–100)

*Skin Questionnaire*
- 10–15 questions covering: skin type self-assessment, current concerns, lifestyle factors (diet, water intake, sun exposure relevant to UAE climate), current products in use, known allergies
- Each question includes a clear title and appropriate input type (single choice, multiple choice, or short text)

**Analysis Result Report**
- Skin health score with visual gauge
- Detected skin type and concern breakdown with severity levels
- Annotated facial map highlighting concern zones (if photo was uploaded)
- AI-generated summary in plain English (and Arabic option)
- Recommended next steps: personalized routine, product suggestions, consult a dermatologist
- Option to share report with a dermatologist or download as PDF

---

### 3.6 Personalized Recommendations

**Skincare Routine**
- AI-generated morning and evening routines based on analysis results
- Each step: step number, product category (cleanser, toner, serum, moisturizer, SPF, etc.), recommended product name, brief usage instruction
- Routine adjusts dynamically if user updates their skin profile or completes a new analysis
- UAE climate considerations applied by default (high UV index, humidity/dryness seasonal variation)

**Product Recommendations**
- Curated product list matched to user's skin profile
- Each product card: image, name, brand, key ingredients, suitability score for user's skin, price (AED), and Add to Cart button
- Filter by: concern, skin type, price range, brand
- Products sourced from marketplace inventory

---

### 3.7 Dermatologist Consultation

**Doctor Listing**
- List of UAE-licensed dermatologists registered on the platform
- Each card: photo, name, specialization, years of experience, languages spoken (Arabic/English), consultation fee (AED), availability indicator, and Book Now button
- Filter by: emirate, language, availability, fee range
- Search by doctor name

**Booking**
- Calendar view of available slots for selected doctor
- Consultation type selection: video call or in-clinic visit
- For in-clinic: clinic address (UAE), map embed
- Booking confirmation with date, time (GST/UTC+4), doctor name, and consultation type
- Option to attach AI skin analysis report to the booking
- Confirmation email sent to user

**Consultation Room**
- Video consultation: in-browser video/audio call
- Text chat alongside video
- Shared view of user's AI analysis report for doctor reference
- Doctor can add notes and prescriptions during the session
- Session recording option (with user consent)

---

### 3.8 Marketplace

**Product Listing**
- Grid/list view of all available skincare products
- Filter by: category, skin type, concern, brand, price range (AED), rating
- Sort by: relevance, price, rating, newest
- Each product card: image, name, brand, price (AED), rating, and Add to Cart

**Product Detail**
- Full product images (gallery)
- Name, brand, description, key ingredients, how to use
- Suitability badge if product matches user's skin profile
- Price in AED with VAT note (5% UAE VAT)
- Stock availability
- Add to Cart / Buy Now
- User reviews and ratings

**Cart & Checkout**
- Cart summary: product list, quantities, subtotal, VAT (5%), delivery fee, total (AED)
- UAE delivery address entry (emirate, area, building, flat)
- Payment methods: credit/debit card, Apple Pay, cash on delivery
- Order confirmation page and confirmation email
- Estimated delivery time displayed

---

### 3.9 Dermatologist Portal

**Patient Queue**
- List of upcoming and past consultations
- Each entry: patient name, scheduled time (GST), consultation type, attached AI report indicator
- Join Call button for video consultations

**AI Report Review**
- Full view of patient's AI skin analysis report
- Side-by-side: AI findings and doctor's own notes area

**Prescription / Notes**
- Doctor can write and save consultation notes
- Prescription form: medication/product name, dosage/usage instructions, duration
- Notes and prescriptions saved to patient's profile and accessible by the patient post-consultation

---

### 3.10 Admin Panel

**User Management**
- List of all registered users with role, registration date, and status (active/suspended)
- Ability to view user profile, suspend, or delete account

**Doctor Management**
- List of registered dermatologists with verification status
- Approve or reject doctor registration
- View doctor profile and consultation history

**Product & Order Management**
- Add, edit, or remove marketplace products
- View all orders with status (pending, processing, shipped, delivered, cancelled)
- Update order status

---

## 4. Business Rules & Logic

### 4.1 AI Analysis Rules
- A new analysis can be initiated at any time; each analysis is saved independently to history
- If both photo upload and questionnaire are completed, the AI combines both inputs for a higher-confidence result
- Skin score is recalculated fresh for each analysis session; historical scores are read-only
- Analysis results are stored in the user's profile and can be shared with any dermatologist on the platform

### 4.2 Recommendation Rules
- Recommendations are regenerated automatically after each new analysis
- Products recommended must be available in the marketplace inventory; out-of-stock products are flagged but still shown
- UAE climate profile (high UV, seasonal humidity) is applied as a default modifier to all routine recommendations
- If user has declared allergies, products containing those ingredients are excluded from recommendations

### 4.3 Consultation & Booking Rules
- Bookings must be made at least 2 hours in advance
- Cancellation is allowed up to 1 hour before the scheduled time; late cancellations are non-refundable
- Consultation fees are charged at booking confirmation
- Video consultation links are generated and sent via email 15 minutes before the session
- Dermatologists must be verified (UAE medical license confirmed) before appearing in the listing

### 4.4 Marketplace & Payment Rules
- All prices displayed in AED
- UAE VAT (5%) applied at checkout
- Delivery available within UAE only
- Orders can be tracked via order status page
- Refund/return requests handled within 7 days of delivery per UAE consumer protection guidelines

### 4.5 Localization Rules
- Platform supports English and Arabic (RTL layout for Arabic)
- Default language detected from browser settings; user can switch at any time
- All dates and times displayed in Gulf Standard Time (GST, UTC+4)
- Currency fixed to AED throughout

---

## 5. Exceptions & Edge Cases

| Scenario | Handling |
|---|---|
| Photo upload fails quality check (blurry, poor lighting, non-face image) | Display specific error message with re-upload guidance; do not proceed to analysis |
| AI analysis confidence score is low | Display low-confidence warning and recommend completing the questionnaire or consulting a dermatologist |
| No dermatologists available in selected emirate | Show available doctors in other emirates with a note |
| Selected consultation slot becomes unavailable after user starts booking | Notify user and redirect to available slots |
| Payment fails at checkout (consultation or marketplace) | Display error, retain cart/booking details, prompt retry or alternative payment method |
| User has declared allergy but a recommended product contains that ingredient | Block product from recommendations; show allergy conflict warning if user manually adds it to cart |
| Marketplace product goes out of stock after being added to cart | Notify user at checkout; prevent order completion for that item |
| Dermatologist does not join video call within 10 minutes of scheduled time | Notify user; offer reschedule or full refund |
| User attempts to access Dermatologist Portal without doctor role | Redirect to user dashboard with access-denied message |
| Admin attempts to delete a doctor with active upcoming bookings | Block deletion; display warning listing affected bookings |

---

## 6. Acceptance Criteria

1. A user can complete an AI skin analysis via photo upload, questionnaire, or both, and receive a full analysis report within 30 seconds of submission.
2. Personalized skincare routine and product recommendations are generated immediately after analysis completion and reflect the user's skin profile and declared allergies.
3. A user can search, filter, and book a UAE-licensed dermatologist for a video or in-clinic consultation, with confirmation sent by email.
4. Video consultation room loads in-browser without requiring any plugin installation, and the AI report is visible to both user and doctor during the session.
5. A user can browse the marketplace, add products to cart, and complete checkout in AED with UAE VAT applied and UAE delivery address accepted.
6. The platform renders correctly in both English (LTR) and Arabic (RTL) layouts, with all times shown in GST (UTC+4).
7. A dermatologist can review the patient's AI report, add notes, and issue a prescription that becomes visible to the patient after the consultation.
8. An admin can approve or reject dermatologist registrations and manage product listings and order statuses from the admin panel.
9. All declared user allergies are excluded from product recommendations, and a conflict warning is shown if the user manually adds a conflicting product to cart.
10. Cancellation and refund rules are enforced: cancellations within 1 hour of consultation are non-refundable; marketplace returns are accepted within 7 days of delivery.

---

## 7. Out of Scope for This Release

- Native mobile applications (iOS / Android)
- AI-powered ingredient scanner via camera (real-time product label scanning)
- Subscription or membership tier system
- Multi-vendor seller onboarding (marketplace is single-operator in this release)
- Insurance or health plan integration
- Loyalty points or rewards program
- Push notifications (mobile)
- Integration with UAE government health portals (e.g., DHA, MOH)
- Multi-country expansion beyond UAE