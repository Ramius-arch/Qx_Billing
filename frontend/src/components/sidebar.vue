<template>
  <aside class="bg-gray-800 text-white w-64 fixed left-0 h-full">
    <div class="p-4">
      <h2 class="text-xl font-bold mb-6">Telecom Billing</h2>
      <nav>
        <router-link to="/dashboard" class="block p-2 hover:bg-gray-700 rounded">Dashboard</router-link>
        <router-link to="/customers" class="block p-2 hover:bg-gray-700 rounded">Customers</router-link>
        <router-link to="/usage" class="block p-2 hover:bg-gray-700 rounded">Usage Tracking</router-link>
        <router-link to="/billing" class="block p-2 hover:bg-gray-700 rounded">Billing Engine</router-link>
        <router-link to="/reports" class="block p-2 hover:bg-gray-700 rounded">Reports</router-link>
      </nav>
    </div>
  </aside>
</template>
