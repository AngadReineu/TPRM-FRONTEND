import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Routes, Route, useLocation, useNavigate, Outlet } from 'react-router';
import { PortalProvider, usePortal } from '../context/PortalContext';
import { PortalHeader } from '../components/PortalHeader';
import { ProgressStepper } from '../components/ProgressStepper';
import { PortalFooter } from '../components/PortalFooter';
import { Step1CompanyInfo } from '../components/Step1CompanyInfo';
import { Step2Documents } from '../components/Step2Documents';
import { Step3Historic } from '../components/Step3Historic';
import { Step4Security } from '../components/Step4Security';
import { Step5Review } from '../components/Step5Review';
import { SuccessScreen } from '../components/SuccessScreen';

/* ── Token validation state ─────────────────────────── */
type TokenState = 'loading' | 'valid' | 'invalid' | 'expired' | 'already_submitted';

interface VendorInfo {
  name: string;
  email: string;
  vendorId: string;
}

/* ── Portal layout (inner, uses nested router) ───────── */
function PortalLayout({ token, vendor }: { token: string; vendor: VendorInfo }) {
  const location = useLocation();
  const match = location.pathname.match(/\/step\/(\d)/);
  const currentStep = match ? parseInt(match[1], 10) : 1;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #ffffff 100%)' }}>
      <PortalHeader />
      <ProgressStepper currentStep={currentStep} />
      <main className="max-w-[860px] mx-auto px-6" style={{ paddingTop: 160, paddingBottom: 96 }}>
        <Outlet context={{ token, vendor }} />
      </main>
      <PortalFooter currentStep={currentStep} canProceed={true} token={token} />
    </div>
  );
}

/* ── Loading screen ──────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8FAFC' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Verifying your portal link...</p>
      </div>
    </div>
  );
}

/* ── Invalid / expired token screens ────────────────── */
function InvalidScreen({ reason }: { reason: TokenState }) {
  const messages: Record<string, { title: string; desc: string }> = {
    invalid:           { title: 'Invalid Link',         desc: 'This portal link is not valid. Please contact your account manager.' },
    expired:           { title: 'Link Expired',         desc: 'This portal link has expired. Please request a new link from your account manager.' },
    already_submitted: { title: 'Already Submitted',    desc: 'This assessment has already been submitted. Thank you for completing your assessment.' },
  };
  const msg = messages[reason] ?? messages.invalid;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F8FAFC' }}>
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-[480px] shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{msg.title}</h1>
        <p className="text-slate-500 text-sm leading-relaxed">{msg.desc}</p>
      </div>
    </div>
  );
}

/* ── Main portal entry point ─────────────────────────── */
export function SupplierPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [tokenState, setTokenState] = useState<TokenState>('loading');
  const [vendor, setVendor] = useState<VendorInfo | null>(null);

  useEffect(() => {
    if (!token) { setTokenState('invalid'); return; }

    if (token === 'demo') {
      setVendor({ name: 'Demo Supplier', email: 'supplier@demo.com', vendorId: 'demo' });
      setTokenState('valid');
      return;
    }

    // Validate the token with the backend
    fetch(`/api/portal/${token}`)
      .then(async res => {
        if (res.status === 404) { setTokenState('invalid'); return; }
        if (res.status === 410) { setTokenState('expired'); return; }
        if (res.status === 409) { setTokenState('already_submitted'); return; }
        if (!res.ok)            { setTokenState('invalid'); return; }
        const data = await res.json();
        setVendor({ name: data.vendor_name, email: data.vendor_email, vendorId: data.vendor_id });
        setTokenState('valid');
      })
      .catch(() => {
        setTokenState('invalid');
      });
  }, [token]);

  if (tokenState === 'loading') return <LoadingScreen />;
  if (tokenState !== 'valid' || !vendor) return <InvalidScreen reason={tokenState} />;

  return (
    <PortalProvider>
      <Routes>
        <Route element={<PortalLayout token={token!} vendor={vendor} />}>
          <Route index element={<Step1CompanyInfo />} />
          <Route path="step/1" element={<Step1CompanyInfo />} />
          <Route path="step/2" element={<Step2Documents />} />
          <Route path="step/3" element={<Step3Historic />} />
          <Route path="step/4" element={<Step4Security />} />
          <Route path="step/5" element={<Step5Review token={token!} vendorId={vendor.vendorId} />} />
        </Route>
        <Route path="success" element={<SuccessScreen />} />
      </Routes>
    </PortalProvider>
  );
}