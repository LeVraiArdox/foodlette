"use client";

import React from "react";
import type { Restaurant } from "@/types/restaurant";
import { useM3Theme } from "@/hooks/useM3Theme";
import { useFoursquareKey } from "@/hooks/useFoursquareKey";
import { useBanLocation } from "@/hooks/useBanLocation";
import { useNearbyRestaurants } from "@/hooks/useNearbyRestaurants";
import { useWheelDeck } from "@/hooks/useWheelDeck";
import { ThemeToolbar } from "@/components/header/ThemeToolbar";
import { LocationSearchBar } from "@/components/search/LocationSearchBar";
import { RestaurantListPane } from "@/components/list/RestaurantListPane";
import { RouletteWheel } from "@/components/wheel/RouletteWheel";
import { RestaurantPopup } from "@/components/popup/RestaurantPopup";
import { ApiKeyDialog } from "@/components/modals/ApiKeyDialog";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

/**
 * Root Client Application Workspace for Foodlette.
 * Composes isolated hooks (M3 theme light/dark mode, Foursquare key, BAN location,
 * nearby restaurant query + Haversine cache, and wheel deck selection) with
 * domain-organized Material 3 Expressive UI components.
 */
export function FoodletteApp() {
  const { isDark, toggleDark, soundEnabled, toggleSound, theme } = useM3Theme();

  const {
    clientApiKey,
    hasServerKey,
    setHasServerKey,
    keyStatusChecked,
    hasActiveApiKey,
    apiHeaders,
    apiKeyDialogOpen,
    setApiKeyDialogOpen,
    apiKeyErrorMsg,
    setApiKeyErrorMsg,
    saveClientKey,
    clearClientKey,
  } = useFoursquareKey();

  const {
    location,
    selectLocation,
    refreshCurrentLocation,
    gpsLoading,
    gpsNotice,
    requestGpsLocation,
    radius,
    setRadius,
  } = useBanLocation(keyStatusChecked);

  // Wheel & Popup UI State
  const [highlightedWheelId, setHighlightedWheelId] = React.useState<
    string | null
  >(null);
  const [popupRestaurant, setPopupRestaurant] =
    React.useState<Restaurant | null>(null);
  const [isWinnerPopup, setIsWinnerPopup] = React.useState<boolean>(false);

  const spinTriggerRef = React.useRef<(() => void) | null>(null);
  const pendingAutoSpinRef = React.useRef<boolean>(false);

  // Refs bridging nearby restaurant load events into wheel deck reset synchronously
  const deckResetRef = React.useRef<(list: Restaurant[]) => void>(() => {});
  const deckClearRef = React.useRef<() => void>(() => {});

  const {
    allRestaurants,
    loadingRestaurants,
    lastLoadCached,
    apiError,
    handleRestaurantEnriched,
  } = useNearbyRestaurants({
    location,
    radius,
    keyStatusChecked,
    hasServerKey,
    clientApiKey,
    apiHeaders,
    onServerKeyDetected: setHasServerKey,
    onApiKeyError: (msg) => {
      setApiKeyErrorMsg(msg);
      setApiKeyDialogOpen(true);
    },
    onClearApiKeyError: () => setApiKeyErrorMsg(null),
    onRestaurantsLoaded: (list) => deckResetRef.current(list),
    onRestaurantsFailed: () => deckClearRef.current(),
  });

  const {
    selectedIds,
    categoryFilter,
    activeWheelRestaurants,
    resetDeckForRestaurants,
    clearDeck,
    handleCategoryChange,
    handleToggleRestaurant,
    handleSelectTopN,
    handleShuffleN,
    excludeRestaurant,
  } = useWheelDeck(allRestaurants);

  deckResetRef.current = resetDeckForRestaurants;
  deckClearRef.current = clearDeck;

  React.useEffect(() => {
    if (pendingAutoSpinRef.current && activeWheelRestaurants.length > 0) {
      pendingAutoSpinRef.current = false;
      const t = setTimeout(() => {
        spinTriggerRef.current?.();
      }, 180);
      return () => clearTimeout(t);
    }
  }, [activeWheelRestaurants]);

  return (
    <div
      style={theme.cssVars as React.CSSProperties}
      className="min-h-screen flex flex-col"
    >
      {/* Top Header & Light/Dark Toolbar */}
      <ThemeToolbar
        isDark={isDark}
        onToggleDark={toggleDark}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        hasActiveApiKey={hasActiveApiKey}
        onOpenApiKeyDialog={() => setApiKeyDialogOpen(true)}
      />

      {/* Main Split Workspace:
          - Left of the wheel: Restaurant List
          - Top of the wheel: BAN (data.gouv.fr) Location Search Bar
          - Centerpiece below search bar: Interactive Roulette Wheel */}
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 py-3 pb-8 flex flex-col-reverse lg:flex-row items-stretch gap-5">
        <RestaurantListPane
          allRestaurants={allRestaurants}
          selectedIds={selectedIds}
          onToggleRestaurant={handleToggleRestaurant}
          onSelectTopN={handleSelectTopN}
          onShuffleN={handleShuffleN}
          onInspectRestaurant={(r) => {
            setIsWinnerPopup(false);
            setPopupRestaurant(r);
          }}
          activeWheelRestaurants={activeWheelRestaurants}
          highlightedWheelId={highlightedWheelId}
          wheelSlices={theme.wheelSlices}
          loading={loadingRestaurants}
          categoryFilter={categoryFilter}
          onChangeCategoryFilter={handleCategoryChange}
        />

        <section className="flex-1 min-w-0 flex flex-col gap-4">
          <LocationSearchBar
            currentLocation={location}
            onSelectLocation={selectLocation}
            onRequestGps={() => requestGpsLocation(false)}
            gpsLoading={gpsLoading}
            gpsNotice={gpsNotice}
            radius={radius}
            onChangeRadius={setRadius}
            lastLoadCached={lastLoadCached}
          />

          {apiError && (
            <ErrorBanner
              message={apiError}
              onOpenApiKeyDialog={() => setApiKeyDialogOpen(true)}
              onRetry={refreshCurrentLocation}
            />
          )}

          <RouletteWheel
            restaurants={activeWheelRestaurants}
            wheelSlices={theme.wheelSlices}
            confettiColors={theme.confettiColors}
            loading={loadingRestaurants}
            soundEnabled={soundEnabled}
            onActiveRestaurantChange={setHighlightedWheelId}
            onWinner={(winner) => {
              setIsWinnerPopup(true);
              setPopupRestaurant(winner);
            }}
            spinTriggerRef={spinTriggerRef}
          />
        </section>
      </main>

      {/* Winner & Details M3 Expressive Dialog Popup (Foursquare + OpenStreetMap + Haversine) */}
      <RestaurantPopup
        restaurant={popupRestaurant}
        originLocation={location}
        isWinnerPopup={isWinnerPopup}
        apiHeaders={apiHeaders}
        onEnriched={handleRestaurantEnriched}
        onClose={() => setPopupRestaurant(null)}
        onSpinAgain={() => {
          setPopupRestaurant(null);
          setTimeout(() => {
            spinTriggerRef.current?.();
          }, 200);
        }}
        canExclude={activeWheelRestaurants.length > 1}
        onExcludeAndSpin={(id) => {
          setPopupRestaurant(null);
          pendingAutoSpinRef.current = true;
          excludeRestaurant(id);
        }}
      />

      {/* Foursquare Places API Key & Quota-Saver Modal */}
      <ApiKeyDialog
        open={apiKeyDialogOpen}
        hasServerKey={hasServerKey}
        currentClientKey={clientApiKey}
        errorMessage={apiKeyErrorMsg}
        onSaveKey={saveClientKey}
        onClearClientKey={clearClientKey}
        onClose={() => setApiKeyDialogOpen(false)}
      />
    </div>
  );
}
