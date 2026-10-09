import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../store/authStore';

export function ServiceStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<{durable:boolean; mode:string} | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    api.get('/health').then(res => setStatus(res.data)).catch(() => setFailed(true));
  }, []);
  if (failed) return <div role="alert" className="text-center text-sm p-3 bg-critical/10 text-critical">Service connection unavailable. Please retry shortly.</div>;
  if (!status) return null;
  return <div className="text-center text-xs p-3 bg-white/5 text-muted">
    {status.mode === 'live' ? 'Live service · Connected to durable database' : 'Demo service · Sample campus data'}
    {!status.durable && ' · Changes are temporary until the database is connected'}
    {user?.email === 'admin@nexa.edu' && status.mode === 'live' && ' · Admin demo: preview only. Sign in with an institution account to publish.'}
  </div>;
}
