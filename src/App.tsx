import React, { useEffect, useState, Suspense } from 'react';

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

function App() {
  const [layout, setLayout] = useState<LayoutBlock[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    Promise.all([
      fetch('/config/ui-config.json').then(r => r.json()),
      fetch('/config/featureFlags.json').then(r => r.json())
    ]).then(([layoutData, flagsData]) => {
      setLayout(layoutData.layout);
      setFlags(flagsData);
    });
  }, []);

  console.log('Layout:', layout);
  console.log('Feature Flags:', flags);

  return (
    <div>
      <h1>🧩 Micro Frontend Host</h1>
      <Suspense fallback={<div>Loading...</div>}>
        {layout.map((block) => {
          const shouldRender = block.enabled && flags[block.featureFlag];
          if (!shouldRender) return null;
          const RemoteComponent = remotes[block.remote];
          console.log("RemoteComponent:", RemoteComponent);
          return (
            <div key={block.id}>
              <RemoteComponent />
            </div>
          );
        })}
      </Suspense>
    </div>
  );
}

export default App;
