import React, { useState } from 'react';
import { FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import './Table.css';

const Table = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data available',
  sortable = true,
  searchable = false,
  searchPlaceholder = 'Search...',
  stickyHeader = true,
  zebraStripes = true,
  onRowClick = null,
  selectedRows = [],
  onRowSelect = null,
  className = '',
  rowClassName = null
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Filter data based on search
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return sortedData;
    
    return sortedData.filter(row =>
      columns.some(column => {
        const value = getNestedValue(row, column.key);
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [sortedData, searchTerm, columns]);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  };

  const handleSort = (columnKey) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRowClick = (row, index) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  const handleRowSelect = (row, checked) => {
    if (onRowSelect) {
      onRowSelect(row, checked);
    }
  };

  const isRowSelected = (row) => {
    return selectedRows.some(selected => 
      selected.id === row.id || selected._id === row._id
    );
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const renderCell = (row, column) => {
    const value = getNestedValue(row, column.key);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className={`table-container ${className}`}>
        {searchable && (
          <div className="table-search">
            <div className="search-input-skeleton"></div>
          </div>
        )}
        <div className={`table-wrapper ${stickyHeader ? 'sticky-header' : ''}`}>
          <table className={`table ${zebraStripes ? 'zebra' : ''}`}>
            <thead>
              <tr>
                {onRowSelect && <th className="table-checkbox-cell"></th>}
                {columns.map(column => (
                  <th key={column.key} className={column.className || ''}>
                    <div className="skeleton-header"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, index) => (
                <tr key={index}>
                  {onRowSelect && <td className="table-checkbox-cell"></td>}
                  {columns.map(column => (
                    <td key={column.key} className={column.className || ''}>
                      <div className="skeleton-cell"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      {searchable && (
        <div className="table-search">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      )}
      
      <div className={`table-wrapper ${stickyHeader ? 'sticky-header' : ''}`}>
        <table className={`table ${zebraStripes ? 'zebra' : ''}`}>
          <thead>
            <tr>
              {onRowSelect && (
                <th className="table-checkbox-cell">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                    onChange={(e) => {
                      const allSelected = e.target.checked;
                      filteredData.forEach(row => {
                        if (allSelected !== isRowSelected(row)) {
                          handleRowSelect(row, allSelected);
                        }
                      });
                    }}
                  />
                </th>
              )}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`${column.className || ''} ${sortable && column.sortable !== false ? 'sortable' : ''}`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="table-header-content">
                    <span>{column.title}</span>
                    {sortable && column.sortable !== false && (
                      <span className="sort-icon">
                        {getSortIcon(column.key)}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (onRowSelect ? 1 : 0)}
                  className="table-empty"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, index) => (
                <tr
                  key={row.id || row._id || index}
                  className={`${onRowClick ? 'clickable' : ''} ${isRowSelected(row) ? 'selected' : ''} ${rowClassName ? rowClassName(row, index) : ''}`}
                  onClick={() => handleRowClick(row, index)}
                >
                  {onRowSelect && (
                    <td className="table-checkbox-cell">
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(row, e.target.checked);
                        }}
                      />
                    </td>
                  )}
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={column.className || ''}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
