PARASHAR JYOTISHA — FREE CONSULTATION WEBSITE FIX

What this package fixes
1. Removes visible consultation prices and marks current consultation requests as FREE.
2. Replaces the old demo-only consultation form with the working Firestore form.
3. Website submissions are saved to Firebase Cloud Firestore collection: consultations.
4. The website also calls the existing Google Apps Script notifier for an admin email and a user confirmation email.
5. Uses support@parasharajyotisha.com as the public/support email.
6. Updates legal/service pages so they no longer describe current consultation as paid.

IMPORTANT
- The internal field paymentStatus: not_started remains in index.html only for compatibility with the existing Firestore security rule. It does NOT mean a payment is collected.
- Do not ask users for card, UPI PIN, bank password, OTP, or payment details.

Deployment order
A. Update Google Apps Script first:
   - Open the existing website consultation notifier Apps Script.
   - Replace Code.gs with google-apps-script-email-notifier-phase1.gs.
   - Deploy a NEW VERSION of the existing Web App (keep the same Web App URL if possible).
B. Upload index.html to the website root, replacing the existing index.html.
C. Upload the updated policy/service pages.
D. Hard refresh https://parasharajyotisha.com/ and submit ONE test consultation.
E. Confirm:
   - page shows a Reference ID;
   - Firestore > consultations has a new document;
   - admin notification arrives at support@parasharajyotisha.com;
   - test user receives confirmation email.

Files
- index.html
- pricing.html (now Service Access / free)
- terms-and-conditions.html
- refund-cancellation-policy.html
- digital-delivery-policy.html
- privacy-policy.html
- about-us.html
- contact-us.html
- disclaimer.html
- data-deletion.html
- legal.html
- google-apps-script-email-notifier-phase1.gs
