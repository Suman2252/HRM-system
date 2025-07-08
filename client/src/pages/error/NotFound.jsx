import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {/* 404 Image/Icon */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-9xl font-bold text-primary-500 opacity-20">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                Oops!
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
          
          <Link to="/">
            <Button
              variant="outline"
              icon={<HomeIcon className="h-5 w-5" />}
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Paper texture and grain overlay */}
      <div className="paper-texture grain-overlay absolute inset-0 -z-10"></div>
    </div>
  );
};

export default NotFound;
