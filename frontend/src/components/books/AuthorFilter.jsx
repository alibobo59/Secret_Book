import React from 'react';
import { User } from 'lucide-react';
import { handleAuthorChange } from './filterHandlers';

const AuthorFilter = ({ filters, setFilters, uniqueAuthors }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <h3 className="font-medium text-gray-900 dark:text-white">Tác Giả</h3>
    </div>
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {uniqueAuthors.map(author => (
        <label key={author} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.authors.includes(author)}
            onChange={() => handleAuthorChange(filters, setFilters, author)}
            className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{author}</span>
        </label>
      ))}
    </div>
  </div>
);

export default AuthorFilter;