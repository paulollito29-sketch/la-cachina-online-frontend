import { useState, useMemo } from 'react'
import type { Category } from '../types/models'

interface CategorySearchSelectorProps {
  categories: Category[]
  selectedCategories: string[]
  onChange: (selected: string[]) => void
  label?: string
  required?: boolean
}

export default function CategorySearchSelector({
  categories,
  selectedCategories,
  onChange,
  label = 'Categorías Asociadas',
  required = false,
}: CategorySearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // Flattened available categories (fallback to default flat categories if empty)
  const allCategories = useMemo(() => {
    if (categories && categories.length > 0) return categories
    return [
      { idCategory: 1, name: 'Chaquetas', description: '', productCount: 0 },
      { idCategory: 2, name: 'Jeans', description: '', productCount: 0 },
      { idCategory: 3, name: 'Polos', description: '', productCount: 0 },
      { idCategory: 4, name: 'Camisas', description: '', productCount: 0 },
    ]
  }, [categories])

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return allCategories
    const query = searchTerm.toLowerCase().trim()
    return allCategories.filter(c =>
      c.name.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query))
    )
  }, [allCategories, searchTerm])

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      if (selectedCategories.length === 1 && required) {
        return // keep at least 1 category if required
      }
      onChange(selectedCategories.filter(name => name !== catName))
    } else {
      onChange([...selectedCategories, catName])
    }
  }

  const removeCategory = (catName: string) => {
    if (selectedCategories.length === 1 && required) return
    onChange(selectedCategories.filter(name => name !== catName))
  }

  return (
    <div className="category-search-selector-wrapper">
      <div className="selector-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: 'var(--brand-volt)' }}>*</span>}
        </label>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {selectedCategories.length} seleccionada{selectedCategories.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Selected tags chip preview */}
      {selectedCategories.length > 0 && (
        <div className="selected-chips-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
          {selectedCategories.map(name => (
            <span
              key={name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--brand-volt)',
                color: '#0D0D10',
                fontSize: '0.78rem',
                fontWeight: 700,
                boxShadow: '0 2px 6px rgba(210, 248, 11, 0.2)',
              }}
            >
              <span>{name}</span>
              <button
                type="button"
                onClick={() => removeCategory(name)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0D0D10',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  lineHeight: 1,
                  padding: 0,
                }}
                title={`Quitar ${name}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Search Input */}
      <div className="category-search-input-box" style={{ position: 'relative', marginBottom: '0.5rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar o filtrar categorías (ej. Chaquetas, Jeans, Polos)..."
          style={{
            width: '100%',
            padding: '0.55rem 2rem 0.55rem 0.75rem',
            background: 'var(--surface-sunken)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: '0.82rem',
          }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Categories chips grid */}
      <div
        className="category-chips-grid"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          maxHeight: '140px',
          overflowY: 'auto',
          padding: '0.35rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        {filteredCategories.length === 0 ? (
          <div style={{ padding: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', width: '100%', textAlign: 'center' }}>
            No se encontraron categorías con "{searchTerm}"
          </div>
        ) : (
          filteredCategories.map(cat => {
            const isSelected = selectedCategories.includes(cat.name)
            return (
              <button
                key={cat.idCategory}
                type="button"
                onClick={() => toggleCategory(cat.name)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-pill)',
                  border: isSelected ? '1.5px solid var(--brand-volt)' : '1px solid var(--border-medium)',
                  background: isSelected ? 'rgba(210, 248, 11, 0.15)' : 'var(--surface)',
                  color: isSelected ? 'var(--brand-volt)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{isSelected ? '✓' : '+'}</span>
                <span>{cat.name}</span>
                {cat.productCount > 0 && (
                  <span style={{ fontSize: '0.68rem', opacity: 0.7 }}>({cat.productCount})</span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
