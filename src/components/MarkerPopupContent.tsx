// src/components/MarkerPopupContent.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {Button, Card} from "@heroui/react";

type Props = {
  name: string;
  categoryLabel: string;
  subtypeLabel: string;
  x: number;
  y: number;
  description: string;
  canComplete: boolean;
  completed: boolean;
  onToggleCompleted: () => void;
};

const MarkerPopupContent: React.FC<Props> = ({
                                               name,
                                               categoryLabel,
                                               subtypeLabel,
                                               x,
                                               y,
                                               description,
                                               canComplete,
                                               completed,
                                               onToggleCompleted,
                                             }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="
      min-w-[260px] max-w-[360px]
      p-3 space-y-2 text-xs leading-snug
      bg-content1 text-foreground
    "
      radius="sm"
    >
      {/* Title */}
      <h3 className="text-sm font-semibold">{name}</h3>

      {/* Category / subtype + coordinates */}
      <p className="text-[11px] text-default-500">
        {categoryLabel} / {subtypeLabel}{" "}
        <span className="opacity-80">
          ({x.toFixed(0)}, {y.toFixed(0)})
        </span>
      </p>

      {/* Description */}
      <div className="pt-1 border-t border-default-200">
        <p className="text-[11px] text-default-600">{description}</p>
      </div>

      {canComplete && (
        <div className="pt-1">
          <Button
            size="sm"
            variant="flat"
            color={completed ? "success" : "default"}
            onPress={onToggleCompleted}
          >
            {completed
              ? t("common:markerActions:markNotCompleted", "Completed")
              : t("common:markerActions:markCompleted", "Mark as completed")}
          </Button>
        </div>
      )}

    </Card>
  );
};

export default MarkerPopupContent;
