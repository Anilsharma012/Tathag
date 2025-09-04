import React from 'react';
import Card from './Card';

const ListCompact = ({ title, items = [], renderRight }) => (
  <Card>
    <div style={{marginBottom:8, fontWeight:600}}>{title}</div>
    <div className="list-compact">
      {items.length === 0 && <div style={{color:'var(--admin-text-muted)'}}>No items</div>}
      {items.map((it, idx) => (
        <div className="item" key={idx}>
          <div style={{minWidth:0}}>{it.title}</div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>{renderRight ? renderRight(it) : null}</div>
        </div>
      ))}
    </div>
  </Card>
);

export default ListCompact;
