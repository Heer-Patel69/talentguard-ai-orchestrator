import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  EyeOff,
  Scale,
  Bell,
  FileText,
  Save,
  RotateCcw,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlassCard } from "@/components/ui/glass-card";

interface FairnessSettings {
  passRateDeviationThreshold: number;
  disparateImpactThreshold: number;
  enableBlindEvaluation: boolean;
  enableScoreReweighting: boolean;
  alertEmailEnabled: boolean;
  alertDashboardEnabled: boolean;
  autoMonthlyAudit: boolean;
}

interface FairnessSettingsPanelProps {
  settings: FairnessSettings;
  onSave: (settings: FairnessSettings) => void;
  className?: string;
}

export function FairnessSettingsPanel({
  settings: initialSettings,
  onSave,
  className,
}: FairnessSettingsPanelProps) {
  const [settings, setSettings] = useState<FairnessSettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const updateSetting = <K extends keyof FairnessSettings>(
    key: K,
    value: FairnessSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setHasChanges(false);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Thresholds Section */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Thresholds</h3>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label>Pass Rate Deviation Threshold</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      Trigger an alert when any group's pass rate deviates more than this percentage from the average.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="secondary" className="tabular-nums">
                {settings.passRateDeviationThreshold}%
              </Badge>
            </div>
            <Slider
              value={[settings.passRateDeviationThreshold]}
              onValueChange={([value]) => updateSetting("passRateDeviationThreshold", value)}
              min={5}
              max={30}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Strict (5%)</span>
              <span>Lenient (30%)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Label>Disparate Impact Threshold</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      The "80% rule" - selection rate for any group should be at least this percentage of the highest group.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Badge variant="secondary" className="tabular-nums">
                {(settings.disparateImpactThreshold * 100).toFixed(0)}%
              </Badge>
            </div>
            <Slider
              value={[settings.disparateImpactThreshold * 100]}
              onValueChange={([value]) => updateSetting("disparateImpactThreshold", value / 100)}
              min={60}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Lenient (60%)</span>
              <span>Strict (100%)</span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Evaluation Modes */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Evaluation Modes</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <EyeOff className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base">Blind Evaluation Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide demographic information from AI scoring
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableBlindEvaluation}
              onCheckedChange={(checked) => updateSetting("enableBlindEvaluation", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Label className="text-base">Score Re-weighting</Label>
                <p className="text-sm text-muted-foreground">
                  Enable statistical adjustment for underrepresented groups
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enableScoreReweighting}
              onCheckedChange={(checked) => updateSetting("enableScoreReweighting", checked)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications & Audits</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Send fairness alerts via email
              </p>
            </div>
            <Switch
              checked={settings.alertEmailEnabled}
              onCheckedChange={(checked) => updateSetting("alertEmailEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Dashboard Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show alerts in dashboard
              </p>
            </div>
            <Switch
              checked={settings.alertDashboardEnabled}
              onCheckedChange={(checked) => updateSetting("alertDashboardEnabled", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Automatic Monthly Audits</Label>
              <p className="text-sm text-muted-foreground">
                Generate monthly fairness reports automatically
              </p>
            </div>
            <Switch
              checked={settings.autoMonthlyAudit}
              onCheckedChange={(checked) => updateSetting("autoMonthlyAudit", checked)}
            />
          </div>
        </div>
      </GlassCard>

      {/* Action Buttons */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-end gap-3"
        >
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </motion.div>
      )}
    </div>
  );
}
