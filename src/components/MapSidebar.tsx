// src/components/MapSidebar.tsx
import React, { useState } from "react";
import { Card, Button, Spinner, Switch } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as SolidIcons from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";

import type { GameMapMeta, MarkerTypeCategory } from "../types/game";

type Props = {
  maps: GameMapMeta[];
  types: MarkerTypeCategory[];
  selectedMapId: string | null;
  onMapChange: (id: string) => void;
  loadingMarkers: boolean;
  subtypeCounts: Map<string, number>;
  completedCounts: Map<string, number>;
  visibleSubtypes: Set<string>;
  onToggleSubtype: (categoryId: string, subtypeId: string) => void;

  showLabels: boolean;
  onToggleShowLabels: (value: boolean) => void;

  onShowAllSubtypes: () => void;
  onHideAllSubtypes: () => void;
};

const MapSidebar: React.FC<Props> = ({
                                       maps,
                                       types,
                                       selectedMapId,
                                       onMapChange,
                                       loadingMarkers,
                                       subtypeCounts,
                                       completedCounts,
                                       visibleSubtypes,
                                       onToggleSubtype,
                                       showLabels,
                                       onToggleShowLabels,
                                       onShowAllSubtypes,
                                       onHideAllSubtypes,
                                     }) => {
  const { t } = useTranslation();

  const [collapsedCategories, setCollapsedCategories] = useState<
    Set<string>
  >(new Set());

  const toggleCategory = (categoryId: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  return (
    <aside className="w-80 border-r border-default-200 p-3 flex flex-col gap-4 overflow-y-auto">
      {/* Map selection */}
      <Card className="p-3">
        <h2 className="text-sm font-semibold mb-2">
          {t("common:menu.maps", "Maps")}
        </h2>
        <div className="flex flex-col gap-2">
          {maps.map((map) => (
            <Button
              key={map.id}
              size="sm"
              variant={map.id === selectedMapId ? "solid" : "light"}
              className="justify-between"
              onPress={() => onMapChange(map.id)}
            >
              {t(`maps:${map.id}.name`, map.id)}
            </Button>
          ))}
          {maps.length === 0 && (
            <p className="text-xs text-default-500">
              No maps loaded.
            </p>
          )}
        </div>
      </Card>

      {/* Marker types */}
      <Card className="p-3 flex-1 overflow-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            {t("common:menu.markerTypes", "Marker Types")}
          </h2>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="light"
              onPress={onShowAllSubtypes}
            >
              {t("common:menu.showAllMarkers", "Show all")}
            </Button>
            <Button
              size="sm"
              variant="light"
              onPress={onHideAllSubtypes}
            >
              {t("common:menu.hideAllMarkers", "Hide all")}
            </Button>
          </div>
        </div>

        {loadingMarkers && (
          <div className="flex items-center gap-2 text-xs text-default-500">
            <Spinner size="sm" />
            <span>Loading markers…</span>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {types.map((cat) => {
            const isCollapsed = collapsedCategories.has(cat.id);

            return (
              <div key={cat.id} className="border border-default-200 rounded-md">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-2 py-1.5 bg-content1 hover:bg-default-100 transition-colors"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <FontAwesomeIcon
                      icon={
                        ((SolidIcons as any)[cat.icon || "faFolder"] as IconDefinition) ??
                        (SolidIcons.faFolder as IconDefinition)
                      }
                      className="text-[12px]"
                    />
                    <span>
                      {t(
                        `types:categories.${cat.id}.name`,
                        cat.id,
                      )}
                    </span>
                  </span>
                  <span className="text-[10px] text-default-500">
                    {isCollapsed ? "＋" : "－"}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="grid grid-cols-2 gap-1 p-1.5">
                    {cat.subtypes.map((sub) => {
                      const key = `${cat.id}::${sub.id}`;
                      const total = subtypeCounts.get(key) ?? 0;
                      const completed = completedCounts.get(key) ?? 0;
                      const active = visibleSubtypes.has(key);
                      const canComplete = (sub as any).canComplete === true;

                      const iconName =
                        (sub as any).icon || (cat as any).icon;
                      const icon: IconDefinition =
                        (SolidIcons as any)[iconName] ??
                        (SolidIcons.faCircleDot as IconDefinition);

                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => onToggleSubtype(cat.id, sub.id)}
                          className={[
                            "flex items-center justify-between text-xs px-2 py-1 rounded border transition-colors",
                            active
                              ? "bg-default-100 border-default-300"
                              : "bg-content1 border-default-200 opacity-60 hover:opacity-80",
                          ].join(" ")}
                        >
                          <span className="flex items-center gap-1 min-w-0">
                            <FontAwesomeIcon
                              icon={icon}
                              className="text-[11px]"
                            />
                            <span className="truncate text-left">
                              {t(
                                `types:subtypes.${cat.id}.${sub.id}.name`,
                                sub.id,
                              )}
                            </span>
                          </span>
                          <span className="text-[11px] text-default-500 ml-2">
                            {canComplete ? `${completed}/${total}` : total}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {types.length === 0 && (
            <p className="text-xs text-default-500">
              No marker types loaded.
            </p>
          )}
        </div>

        {/* Label toggle */}
        <div className="mt-2 flex items-center justify-between">
          <Switch
            size="sm"
            isSelected={showLabels}
            onValueChange={onToggleShowLabels}
          >
            <span className="text-xs text-default-600">
              {t("common:menu.showNamesOnPins", "Show names on pins")}
            </span>
          </Switch>
        </div>
      </Card>
    </aside>
  );
};

export default MapSidebar;
