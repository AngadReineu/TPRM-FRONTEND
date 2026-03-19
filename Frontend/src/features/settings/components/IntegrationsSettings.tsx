import { IntegrationCard } from './IntegrationCard';

export function IntegrationsSettings() {
  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-5">Connected Integrations</div>
      <IntegrationCard name="Microsoft Azure" icon="AZ" connected status="Connected \u00b7 312 assets" />
      <IntegrationCard name="Google Cloud Platform" icon="GCP" connected status="Connected \u00b7 185 assets" />
      <IntegrationCard name="Microsoft 365" icon="M365" connected status="Connected \u00b7 156 assets" />
      <IntegrationCard name="Active Directory" icon="AD" connected status="Connected \u00b7 89 assets" />
      <IntegrationCard name="ServiceNow" icon="SN" connected={false} status="Not connected" />
      <IntegrationCard name="Splunk" icon="SPL" connected={false} status="Degraded \u00b7 Reconnect needed" />
      <IntegrationCard name="Slack / Teams" icon="SLK" connected={false} status="Not connected" />
    </div>
  );
}
