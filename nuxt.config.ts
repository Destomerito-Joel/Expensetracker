// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  srcDir: "app/",
  // Nuxt compatibility date
  compatibilityDate: "2025-07-15",

  // Nuxt modules
  modules: [
    "@nuxtjs/tailwindcss", // TailwindCSS
    "@pinia/nuxt"          // Pinia store
  ],

  // Global CSS
  css: [
    "primeicons/primeicons.css" // PrimeIcons
  ],

  // Google Fonts
  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Poppins:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },

  // Runtime config
  runtimeConfig: {
    amadeusApiKey: process.env.AMADEUS_API_KEY,
    amadeusApiSecret: process.env.AMADEUS_API_SECRET,
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    hotelsApiKey: process.env.HOTELS_API_KEY,
    public: {
        firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      paystackPublicKey: process.env.NUXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      usdToNgnRate: process.env.NUXT_PUBLIC_USD_TO_NGN_RATE,
    }
  },

  // DevTools
  devtools: {
    enabled: true
  },

  // Vite-specific settings (optional but can help with .convex imports)
  vite: {
    resolve: {
      preserveSymlinks: true
    }
  },

  // TypeScript settings
  typescript: {
    includeWorkspace: true
  },
  
});
