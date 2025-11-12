import React from 'react';

export default function AdminProfile() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-bitchest-blue mb-6">
        My Profile (Admin)
      </h1>
      <div className="rounded-lg border border-bitchest-light-blue bg-bitchest-white p-6">
        {/* TODO: Show current admin details, allow editing email, name, etc. */}
        <div className="text-bitchest-blue">
          Profile management for admins coming soon…
        </div>
      </div>
    </div>
  );
}
