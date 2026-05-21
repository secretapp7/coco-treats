import { BusinessSettingsForms } from "@/components/admin/settings/business-settings-forms";
import { getAdminBusinessSettings } from "@/lib/admin/data/settings-queries";

export default async function AdminSettingsPage() {
  const settings = await getAdminBusinessSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[color:var(--accent-cocoa)]">Settings</h1>
        <p className="mt-1 max-w-2xl text-sm text-[color:var(--muted-text)]">
          Edit business identity, contact channels, and customer-facing copy stored in{" "}
          <code className="font-mono text-xs">BusinessSetting</code>. Values fall back to{" "}
          <code className="font-mono text-xs">config/brand.ts</code> and translations when a row is missing.
          Admin secrets (passwords, API tokens) remain in environment variables only.
        </p>
      </div>

      <BusinessSettingsForms settings={settings} />
    </div>
  );
}
