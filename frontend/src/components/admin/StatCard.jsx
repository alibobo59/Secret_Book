import React from "react";

/**
 * Reusable StatCard component for admin dashboard statistics
 *
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.iconBgColor - Background color class for the icon
 * @param {string} props.iconColor - Text color class for the icon
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Statistic value to display
 */
const StatCard = ({
  icon,
  iconBgColor = "bg-amber-100",
  iconColor = "text-amber-600",
  title,
  value,
}) => {
  const darkIconBgColor = iconBgColor
    .replace("bg-", "dark:bg-")
    .replace("100", "900");
  const darkIconColor = iconColor
    .replace("text-", "dark:text-")
    .replace("600", "300");

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center">
        <div
          className={`p-3 rounded-full ${iconBgColor} ${darkIconBgColor} ${iconColor} ${darkIconColor} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-800 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
