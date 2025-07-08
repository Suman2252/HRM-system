import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  HomeIcon,
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
    { name: 'Employees', href: '/employees', icon: UsersIcon, roles: ['admin', 'hr', 'hr_manager'] },
    { name: 'Attendance', href: '/attendance', icon: ClockIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
    { name: 'Leave Management', href: '/leave', icon: CalendarDaysIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
    { name: 'On Duty', href: '/onduty', icon: BriefcaseIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
    { name: 'Request History', href: '/request-history', icon: ClockIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
    { name: 'Payroll', href: '/payroll', icon: CurrencyDollarIcon, roles: ['admin', 'hr', 'hr_manager'] },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['admin', 'hr', 'hr_manager'] },
    { 
      name: 'Analytics', 
      icon: PresentationChartLineIcon, 
      roles: ['admin', 'hr_manager'],
      subItems: [
        { name: 'Employee Analytics', href: '/analytics/employee', icon: UsersIcon, roles: ['admin', 'hr_manager'] }
      ]
    },
    { 
      name: 'Management', 
      icon: BuildingOfficeIcon, 
      roles: ['admin', 'hr', 'hr_manager', 'employee'],
      subItems: [
        { name: 'Complaints', href: '/complaints', icon: ExclamationTriangleIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
        { name: 'Office Circular', href: '/office-circular', icon: DocumentTextIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] }
      ]
    },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['admin', 'hr', 'hr_manager', 'employee'] },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const toggleExpand = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-2xl font-heading font-bold text-primary-600 dark:text-primary-400">
          HRM System
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {filteredNavigation.map((item) => (
                <li key={item.name}>
                  {item.subItems ? (
                    <div>
                      <button
                        className={`
                          w-full nav-link flex items-center justify-between
                          ${isActive(item.href) ? 'nav-link-active' : 'nav-link-inactive'}
                        `}
                        onClick={() => toggleExpand(item.name)}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item.name}</span>
                        </div>
                        {expandedItems[item.name] ? (
                          <ChevronDownIcon className="h-4 w-4 ml-2" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 ml-2" />
                        )}
                      </button>
                      {expandedItems[item.name] && (
                        <ul className="mt-1 space-y-1 pl-10">
                          {item.subItems.map((subItem) => (
                            <li key={subItem.name}>
                              <Link
                                to={subItem.href}
                                className={`
                                  nav-link
                                  ${isActive(subItem.href) ? 'nav-link-active' : 'nav-link-inactive'}
                                `}
                                onClick={() => setOpen(false)}
                              >
                                <subItem.icon
                                  className="h-5 w-5 shrink-0"
                                  aria-hidden="true"
                                />
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`
                        nav-link
                        ${isActive(item.href) ? 'nav-link-active' : 'nav-link-inactive'}
                      `}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon
                        className="h-6 w-6 shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </li>

          {/* User info */}
          <li className="mt-auto">
            <div className="flex items-center gap-x-4 px-4 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
              <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="sr-only">Your profile</span>
                <span aria-hidden="true">{user?.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 pb-4">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
