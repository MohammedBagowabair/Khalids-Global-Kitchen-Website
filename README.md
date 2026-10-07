# Khalids Global Kitchen — website concept (EN / BM)

Bilingual pitch website for **Khalids Global Kitchen**, Ground Floor, Lot 604, 605 & 20017, Seksyen 57, Bukit Bintang, 55100 Kuala Lumpur.

Live: https://mohammedbagowabair.github.io/Khalids-Global-Kitchen-Website/ · Malay: `?lang=ms`

- Live open/closed status and a 24-hour dial computed in Kuala Lumpur time (daily 11 AM – 2 AM)
- Menu highlights (dish names from the restaurant's foodpanda listing and a diner's Lemon8 post; no prices)
- Table / takeaway request builder → prefilled WhatsApp message in the visitor's language
- foodpanda + TikTok links, directions (Google Maps / Waze), bilingual FAQ, bilingual 404

Food photos are illustrative Unsplash images, not Khalids dishes. Halal status, prices and menu details are intentionally not stated — visitors are asked to check on WhatsApp.

Stack: Vite + React + TypeScript + Tailwind, self-hosted fonts (Reem Kufi, Karla), WebP images.

```bash
npm ci
BASE_PATH=/Khalids-Global-Kitchen-Website/ npm run build
npx gh-pages -d dist
```

_Website concept prepared for this restaurant. Not an official site yet._
