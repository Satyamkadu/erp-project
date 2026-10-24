import { useState, useEffect } from 'react';
import { assetsApi, usersApi } from '../api';

const statusColors = {
  'Available': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Allocated': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Maintenance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'Retired': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'Lost': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const allocationStatusColors = {
  'Allocated': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Returned': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

function PlusIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function ArrowUpDownIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
}

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assets');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [assetForm, setAssetForm] = useState({ asset_name: '', category: '', serial_number: '', purchase_date: '', status: 'Available' });
  const [allocationForm, setAllocationForm] = useState({ asset: '', employee: '', allocation_date: '', return_date: '', status: 'Allocated' });

  const fetchData = async () => {
    try {
      const [assetsRes, allocationsRes, employeesRes] = await Promise.all([
        assetsApi.listAssets(),
        assetsApi.listAllocations(),
        usersApi.listEmployees(),
      ]);
      setAssets(assetsRes.data);
      setAllocations(allocationsRes.data);
      setEmployees(employeesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      asset.serial_number?.toLowerCase().includes(search.toLowerCase()) ||
      asset.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAllocations = allocations.filter(allocation => {
    const asset = assets.find(a => a.public_id === allocation.asset);
    const employee = employees.find(e => e.public_id === allocation.employee);
    const matchesSearch = asset?.asset_name.toLowerCase().includes(search.toLowerCase()) ||
      employee?.first_name.toLowerCase().includes(search.toLowerCase()) ||
      employee?.last_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || allocation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    try {
      await assetsApi.createAsset(assetForm);
      setShowAssetModal(false);
      setAssetForm({ asset_name: '', category: '', serial_number: '', purchase_date: '', status: 'Available' });
      fetchData();
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  const handleUpdateAsset = async (e) => {
    e.preventDefault();
    try {
      await assetsApi.updateAsset(editingAsset.public_id, assetForm);
      setShowAssetModal(false);
      setEditingAsset(null);
      setAssetForm({ asset_name: '', category: '', serial_number: '', purchase_date: '', status: 'Available' });
      fetchData();
    } catch (error) {
      console.error('Failed to update asset:', error);
    }
  };

  const handleDeleteAsset = async (publicId) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await assetsApi.deleteAsset(publicId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const handleCreateAllocation = async (e) => {
    e.preventDefault();
    try {
      await assetsApi.createAllocation(allocationForm);
      setShowAllocationModal(false);
      setAllocationForm({ asset: '', employee: '', allocation_date: '', return_date: '', status: 'Allocated' });
      fetchData();
    } catch (error) {
      console.error('Failed to create allocation:', error);
    }
  };

  const handleUpdateAllocation = async (e) => {
    e.preventDefault();
    try {
      await assetsApi.updateAllocation(editingAllocation.public_id, allocationForm);
      setShowAllocationModal(false);
      setEditingAllocation(null);
      setAllocationForm({ asset: '', employee: '', allocation_date: '', return_date: '', status: 'Allocated' });
      fetchData();
    } catch (error) {
      console.error('Failed to update allocation:', error);
    }
  };

  const handleDeleteAllocation = async (publicId) => {
    if (!confirm('Are you sure you want to delete this allocation?')) return;
    try {
      await assetsApi.deleteAllocation(publicId);
      fetchData();
    } catch (error) {
      console.error('Failed to delete allocation:', error);
    }
  };

  const openEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      asset_name: asset.asset_name,
      category: asset.category,
      serial_number: asset.serial_number || '',
      purchase_date: asset.purchase_date || '',
      status: asset.status,
    });
    setShowAssetModal(true);
  };

  const openEditAllocation = (allocation) => {
    setEditingAllocation(allocation);
    setAllocationForm({
      asset: allocation.asset,
      employee: allocation.employee,
      allocation_date: allocation.allocation_date,
      return_date: allocation.return_date || '',
      status: allocation.status,
    });
    setShowAllocationModal(true);
  };

  const openAllocateAsset = (asset) => {
    setEditingAllocation(null);
    const today = new Date().toISOString().split('T')[0];
    setAllocationForm({
      asset: asset.public_id,
      employee: '',
      allocation_date: today,
      return_date: '',
      status: 'Allocated',
    });
    setShowAllocationModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track company assets and allocations</p>
        </div>
        {activeTab === 'assets' && (
          <button
            onClick={() => { setEditingAsset(null); setAssetForm({ asset_name: '', category: '', serial_number: '', purchase_date: '', status: 'Available' }); setShowAssetModal(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Asset</span>
          </button>
        )}
        {activeTab === 'allocations' && (
          <button
            onClick={() => { setEditingAllocation(null); const today = new Date().toISOString().split('T')[0]; setAllocationForm({ asset: '', employee: '', allocation_date: today, return_date: '', status: 'Allocated' }); setShowAllocationModal(true); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Allocation</span>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('assets')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'assets' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Assets ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('allocations')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'allocations' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            Allocations ({allocations.length})
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="">All Statuses</option>
              {activeTab === 'assets' ? (
                <>
                  <option value="Available">Available</option>
                  <option value="Allocated">Allocated</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                  <option value="Lost">Lost</option>
                </>
              ) : (
                <>
                  <option value="Allocated">Allocated</option>
                  <option value="Returned">Returned</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {activeTab === 'assets' && (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Serial Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchase Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAssets.map((asset) => (
                  <tr key={asset.public_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{asset.asset_name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{asset.category}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{asset.serial_number || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[asset.status] || 'bg-gray-100 text-gray-800'}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{asset.purchase_date || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {asset.status === 'Available' && (
                          <button
                            onClick={() => openAllocateAsset(asset)}
                            className="px-3 py-1 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900 rounded hover:bg-primary-200 dark:hover:bg-primary-800"
                          >
                            Allocate
                          </button>
                        )}
                        <button
                          onClick={() => openEditAsset(asset)}
                          className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset.public_id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No assets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'allocations' && (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allocation Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Return Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAllocations.map((allocation) => {
                  const asset = assets.find(a => a.public_id === allocation.asset);
                  const employee = employees.find(e => e.public_id === allocation.employee);
                  return (
                    <tr key={allocation.public_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{asset?.asset_name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{allocation.allocation_date}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{allocation.return_date || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${allocationStatusColors[allocation.status] || 'bg-gray-100 text-gray-800'}`}>
                          {allocation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditAllocation(allocation)}
                            className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAllocation(allocation.public_id)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAllocations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No allocations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAssetModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingAsset ? 'Edit Asset' : 'Add Asset'}
              </h2>
              <form onSubmit={editingAsset ? handleUpdateAsset : handleCreateAsset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={assetForm.asset_name}
                    onChange={(e) => setAssetForm({...assetForm, asset_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({...assetForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={assetForm.serial_number}
                    onChange={(e) => setAssetForm({...assetForm, serial_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={assetForm.purchase_date}
                    onChange={(e) => setAssetForm({...assetForm, purchase_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                  <select
                    value={assetForm.status}
                    onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Allocated">Allocated</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAssetModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingAsset ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAllocationModal(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingAllocation ? 'Edit Allocation' : 'Allocate Asset'}
              </h2>
              <form onSubmit={editingAllocation ? handleUpdateAllocation : handleCreateAllocation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Asset *</label>
                  <select
                    required
                    value={allocationForm.asset}
                    onChange={(e) => setAllocationForm({...allocationForm, asset: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Asset</option>
                    {assets.filter(a => a.status === 'Available' || (editingAllocation && a.public_id === allocationForm.asset)).map(a => (
                      <option key={a.public_id} value={a.public_id}>{a.asset_name} ({a.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Employee *</label>
                  <select
                    required
                    value={allocationForm.employee}
                    onChange={(e) => setAllocationForm({...allocationForm, employee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.public_id} value={e.public_id}>{e.first_name} {e.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Allocation Date *</label>
                  <input
                    type="date"
                    required
                    value={allocationForm.allocation_date}
                    onChange={(e) => setAllocationForm({...allocationForm, allocation_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Return Date</label>
                  <input
                    type="date"
                    value={allocationForm.return_date}
                    onChange={(e) => setAllocationForm({...allocationForm, return_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
                  <select
                    value={allocationForm.status}
                    onChange={(e) => setAllocationForm({...allocationForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Allocated">Allocated</option>
                    <option value="Returned">Returned</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllocationModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingAllocation ? 'Update' : 'Allocate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}