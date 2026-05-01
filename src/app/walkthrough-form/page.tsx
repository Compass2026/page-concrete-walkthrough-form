import { Suspense } from 'react'
import WalkthroughForm from '@/components/WalkthroughForm'

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', flexDirection: 'column', gap: '1rem',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 40, height: 40, border: '4px solid #E2E8F0',
        borderTopColor: '#1D4ED8', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ margin: 0, color: '#64748B', fontSize: 15, fontWeight: 600 }}>
        Loading job details…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function WalkthroughFormPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WalkthroughForm />
    </Suspense>
  )
}
