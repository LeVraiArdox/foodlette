# Foodlette — Material 3 Expressive Restaurant Roulette

Someday, I couldn't decidd where to eat, so I built this. 

It's a roulette wheel of nearby restaurants, cafés, bakeries, and eateries, with a Material 3 Expressive UI.

> [!IMPORTANT]
> The current geocoding backend is **limited to France** (BAN / data.gouv.fr), but the Foursquare Places API can discover venues worldwide. If you want to use Foodlette outside of France, you can still search for nearby restaurants, cafés, bakeries, and eateries by providing a valid Foursquare Places API key.

## API stack
- **Geocoding**: Official French open-data geocoder ([data.gouv.fr BAN](https://www.data.gouv.fr/dataservices/api-adresse-base-adresse-nationale-ban) via IGN Géoplateforme `https://data.geopf.fr/geocodage/search` & `/reverse`) — **100% free, zero API key required**.
- **Address & Venue Informations: Foursquare Places API**: Discovers nearby restaurants, cafés, bakeries, and eateries (`https://places-api.foursquare.com/places/search` & `/places/{fsq_place_id}`, with automatic compatibility for both modern Service API Keys and legacy `fsq3` keys, 24h persistent disk + `localStorage` caching, and open-data **Panoramax** IGN/OSM street-view imagery fallback).
- **Cartography Display: OpenStreetMap**: Interactive Leaflet + official OpenStreetMap tile cartography (`tile.openstreetmap.org`) with custom M3 Expressive markers, geodesic Haversine vector overlay, and OpenStreetMap routing links (`openstreetmap.org/directions`).
- **Distance & Travel Time: Maths**: Geodesic great-circle distance ($R = 6\,371\,008.8\text{ m}$).

## Getting Started

1. Create a free **Foursquare Places API Key** at [foursquare.com/developers](https://foursquare.com/developers/).
2. Provide your key either:
   - **Directly in the browser UI**: Click **Set Foursquare Key** in the top Material 3 Expressive toolbar, or
   - **Via `.env` / `.env.local`**:
     ```bash
     cp .env.local.example .env.local
     # Set FOURSQUARE_API_KEY=your_key_here
     ```
3. Run the development server:

```bash
cd ~/Documents/Foodlette
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## DISCLAIMER

This project is **mostly Vibe Coded**. I don't hide it. Even tho I reviewed the code, most of the code is AI generated.