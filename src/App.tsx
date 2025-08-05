import React, { useEffect, useState, Suspense } from 'react';

const remotes = {
  dashboard: React.lazy(() => import('dashboard/DashboardApp')),
  sidebar: React.lazy(() => import('sidebar/SidebarApp')),
  trend: React.lazy(() => import('trend/TrendApp')),
};

function App() {
  const [layout, setLayout] = useState([]);
  const [flags, setFlags] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/config/ui-config.json').then(r => r.json()),
      fetch('/config/featureFlags.json').then(r => r.json())
    ]).then(([layoutData, flagsData]) => {
      setLayout(layoutData.layout);
      setFlags(flagsData);
    });
  }, []);

  return (
    <div>
      <h1>🧩 Micro Frontend Host</h1>
      <Suspense fallback={<div>Loading...</div>}>
        {layout.map((block) => {
          const shouldRender = block.enabled && flags[block.featureFlag];
          if (!shouldRender) return null;
          const RemoteComponent = remotes[block.remote];
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
