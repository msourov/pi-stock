import React from 'react';

interface Props {
  currentPage: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ currentPage, totalCount, limit, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages || 1}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;