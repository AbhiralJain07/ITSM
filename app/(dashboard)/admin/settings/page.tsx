"use client";
import { DashboardSkeleton } from "@/components/ui/DashboardSkeleton";
import { useToast } from "@/context/ToastContext";
import { useEffect } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  useEffect(() => {
    toast("Opening global system configurations...", "info");
  }, [toast]);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">System Settings</h1>
        <p className="text-muted-foreground font-medium text-lg">Configure enterprise thresholds and global defaults.</p>
      </div>
      <DashboardSkeleton />
    </div>
  );
}
