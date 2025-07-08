import { motion } from 'framer-motion';

const DashboardCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-blue-600',
  bgColor = 'bg-blue-100 dark:bg-blue-900',
  change,
  changeType = 'increase'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {value}
            </p>
            {change && (
              <span className={`ml-2 flex items-baseline text-sm font-semibold ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCard;
