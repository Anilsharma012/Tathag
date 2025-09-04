import React from 'react';
import Card from './Card';

const TableMini = ({ title, columns = [], rows = [] }) => (
  <Card>
    <div style={{marginBottom:8, fontWeight:600}}>{title}</div>
    <div style={{maxHeight: 260, overflow:'auto'}}>
      <table className="table-mini">
        <thead>
          <tr>
            {columns.map((c) => (<th key={c.key}>{c.label}</th>))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} style={{color:'var(--admin-text-muted)', padding:'16px'}}>No data</td></tr>
          )}
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (<td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

export default TableMini;
