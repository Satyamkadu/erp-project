import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsApi, assetsApi, usersApi } from '../api';

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function ProjectsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function AssetsIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function TasksIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 2v13m-3-13v13m-3-13v13" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function SpinnerIcon({ className }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function DashboardPage() {
  const { employee, role } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    assetsAllocated: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const colorBgClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
  };

  const statItems = [
    { key: 'employees', name: 'Total Employees', icon: UsersIcon, color: 'blue' },
    { key: 'projects', name: 'Active Projects', icon: ProjectsIcon, color: 'green' },
    { key: 'assetsAllocated', name: 'Assets Allocated', icon: AssetsIcon, color: 'purple' },
    { key: 'pendingTasks', name: 'Pending Tasks', icon: TasksIcon, color: 'orange' },
  ];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [projectsRes, assetsRes, employeesRes, tasksRes] = await Promise.allSettled([
        projectsApi.listProjects(),
        assetsApi.listAllocations(),
        usersApi.listEmployees(),
        projectsApi.listTasks(),
      ]);

      // Projects - count active ones
      const projectsCount = projectsRes.status === 'fulfilled' 
        ? projectsRes.value.data.filter(p => p.status === 'Active').length 
        : 0;

      // Assets - count allocated ones
      const assetsAllocatedCount = assetsRes.status === 'fulfilled'
        ? assetsRes.value.data.filter(a => a.status === 'Allocated').length
        : 0;

      // Employees - count active ones
      const employeesCount = employeesRes.status === 'fulfilled'
        ? employeesRes.value.data.filter(e => e.employment_status === 'Active').length
        : 0;

      // Tasks - count pending (To Do + In Progress)
      const pendingTasksCount = tasksRes.status === 'fulfilled'
        ? tasksRes.value.data.filter(t => t.status === 'To Do' || t.status === 'In Progress').length
        : 0;

      setStats({
        employees: employeesCount,
        projects: projectsCount,
        assetsAllocated: assetsAllocatedCount,
        pendingTasks: pendingTasksCount,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {employee?.first_name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Loading dashboard...
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full">
              {role?.role_name}
            </span>
          </div>
        </div>

        {/* Stats Grid - Loading Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((stat) => (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse" />
                </div>
                <div className={`${colorBgClasses[stat.color]} p-3 rounded-lg`}>
                  <stat.icon className={`${colorClasses[stat.color]} w-6 h-6`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {employee?.first_name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your ERP system today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full">
            {role?.role_name}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats[stat.key]}</p>
              </div>
              <div className={`${colorBgClasses[stat.color]} p-3 rounded-lg`}>
                <stat.icon className={`${colorClasses[stat.color]} w-6 h-6`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/projects" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center">
            <ProjectsIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Create Project</p>
          </a>
          <a href="/assets" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center">
            <AssetsIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Allocate Asset</p>
          </a>
          <a href="/employees" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center">
            <UsersIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Add Employee</p>
          </a>
          <a href="/projects/tasks" className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-center">
            <TasksIcon className="w-8 h-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Create Task</p>
          </a>
        </div>
      </div>

      {/* Recent Activity - Empty state until we add activity feed API */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">Activity feed will appear here as you use the system.</p>
        </div>
      </div>
    </div>
  );
}