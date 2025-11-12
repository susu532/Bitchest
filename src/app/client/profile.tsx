import React from 'react';

export default function ClientProfile() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">
        My Profile (Client)
      </h1>
      <div className="rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6">
        {/* TODO: Actual editable personal info for client */}
        <div className="text-bitchest-blue">
          Profile management for clients coming soon…
        </div>
      </div>
    </div>
  );
}
