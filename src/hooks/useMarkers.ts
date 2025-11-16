// src/hooks/useMarkers.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MarkerInstance, RawMarkersFile } from "../types/game";
import { fetchYaml } from "../utils/yamlLoader";
import { flattenMarkers } from "../utils/markerUtils";

const COMPLETED_STORAGE_PREFIX = "aion2.completedMarkers.v1.";

export function useMarkers(selectedMapId: string | null) {
  const [markers, setMarkers] = useState<MarkerInstance[]>([]);
  const [loading, setLoading] = useState(false);

  // Set of completed marker keys for the *current map*.
  // Keys are "categoryId::subtypeId::markerId".
  const [completedSet, setCompletedSet] = useState<Set<string>>(
    () => new Set(),
  );

  // --- Helper: build a completion key (no mapId inside, since we store per-map) ---
  const buildCompletedKey = useCallback(
    (marker: MarkerInstance) =>
      `${marker.categoryId}::${marker.subtypeId}::${marker.id}`,
    [],
  );

  // --- Load markers for the selected map ---
  useEffect(() => {
    if (!selectedMapId) {
      setMarkers([]);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const raw = await fetchYaml<RawMarkersFile>(
          `data/markers/${selectedMapId}.yaml`,
        );
        if (cancelled) return;
        const flat = flattenMarkers(raw);
        setMarkers(flat);
      } catch (e) {
        console.error(e);
        if (!cancelled) setMarkers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedMapId]);

  // --- Total marker counts per subtype (N) ---
  const subtypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of markers) {
      const key = `${m.categoryId}::${m.subtypeId}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [markers]);

  // --- Load completion state per map from localStorage ---
  useEffect(() => {
    if (!selectedMapId) {
      setCompletedSet(new Set());
      return;
    }

    const storageKey = `${COMPLETED_STORAGE_PREFIX}${selectedMapId}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      setCompletedSet(new Set());
      return;
    }

    try {
      const parsed = JSON.parse(raw) as string[];
      setCompletedSet(new Set(parsed));
    } catch {
      setCompletedSet(new Set());
    }
  }, [selectedMapId]);

  // --- Save completion state per map to localStorage ---
  useEffect(() => {
    if (!selectedMapId) return;
    const storageKey = `${COMPLETED_STORAGE_PREFIX}${selectedMapId}`;
    const arr = Array.from(completedSet);
    localStorage.setItem(storageKey, JSON.stringify(arr));
  }, [completedSet, selectedMapId]);

  // --- Toggle a marker's completed state ---
  const toggleMarkerCompleted = useCallback(
    (marker: MarkerInstance) => {
      const key = buildCompletedKey(marker);

      setCompletedSet((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    },
    [buildCompletedKey],
  );

  // --- Completed counts per subtype (X in X/N) ---
  const completedCounts = useMemo(() => {
    const map = new Map<string, number>();

    for (const marker of markers) {
      const subtypeKey = `${marker.categoryId}::${marker.subtypeId}`;
      const completedKey = buildCompletedKey(marker);
      if (!completedSet.has(completedKey)) continue;

      map.set(subtypeKey, (map.get(subtypeKey) ?? 0) + 1);
    }

    return map;
  }, [markers, completedSet, buildCompletedKey]);

  return {
    markers,
    loading,
    subtypeCounts,

    // NEW for completion feature:
    completedSet,
    completedCounts,
    toggleMarkerCompleted,
  };
}
