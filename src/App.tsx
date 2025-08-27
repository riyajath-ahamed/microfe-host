import React, { useEffect, useState, Suspense } from 'react';

// ✅ Lazy imports with fallback wrapper
const remotes = {
  dashboard: React.lazy(() => import('dashboard/Dashboard')),
  sidebar: React.lazy(() => import('sidebar/Sidebar')),
  trend: React.lazy(() => import('trend/Trend')),
};

type LayoutBlock = {
  id: string;
  remote: keyof typeof remotes;
  enabled: boolean;
  featureFlag: string;
};

// ✅ Simple error boundary for remotes
class RemoteErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Remote component failed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red' }}>⚠️ Failed to load remote</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [layout, setLayout] = useState<LayoutBlock[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetch('/config/ui-config.json').then(r => r.json()),
      fetch('/config/featureFlags.json').then(r => r.json())
    ]).then(([layoutResult, flagsResult]) => {
      if (cancelled) return;

      if (layoutResult.status === "fulfilled") {
        setLayout(layoutResult.value.layout || []);
      } else {
        console.error("Failed to load layout config:", layoutResult.reason);
      }

      if (flagsResult.status === "fulfilled") {
        setFlags(flagsResult.value || {});
      } else {
        console.error("Failed to load feature flags:", flagsResult.reason);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div>⏳ Loading configuration...</div>;

  return (
    <div>
      <h1>🧩 Micro Frontend Host</h1>
      <Suspense fallback={<div>Loading remote...</div>}>
        {layout.map((block) => {
          const shouldRender = block.enabled && flags[block.featureFlag];
          if (!shouldRender) return null;

          const RemoteComponent = remotes[block.remote];
          if (!RemoteComponent) {
            console.warn(`Remote "${block.remote}" not found in remotes map.`);
            return null;
          }

          return (
            <RemoteErrorBoundary key={block.id}>
              <RemoteComponent />
            </RemoteErrorBoundary>
          );
        })}
      </Suspense>
    </div>
  );
}

export default App;
