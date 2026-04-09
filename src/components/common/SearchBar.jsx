import React, { useState, useCallback } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import searchService from '../../services/searchService';

let debounceTimer = null;

/**
 * SearchBar – Ô tìm kiếm có autocomplete (debounce 300ms).
 * Gõ ≥ 2 ký tự → gọi API gợi ý. Enter/chọn → navigate /search?keyword=...
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState('');

  const handleSearch = useCallback((text) => {
    clearTimeout(debounceTimer);
    if (!text || text.length < 2) { setOptions([]); return; }
    debounceTimer = setTimeout(async () => {
      try {
        const res = await searchService.getSuggestions(text);
        const suggestions = Array.isArray(res) ? res : [];
        setOptions(
          suggestions.map(s => ({
            value: s.name,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={s.thumbnailUrl || 'https://via.placeholder.com/36'}
                  alt=""
                  style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }}
                />
                <span style={{ fontSize: 13 }}>{s.name}</span>
              </div>
            ),
            id: s.id,
          }))
        );
      } catch (_) { setOptions([]); }
    }, 300);
  }, []);

  const handleSelect = (val, option) => {
    if (option.id) navigate(`/products/${option.id}`);
    else navigate(`/search?keyword=${encodeURIComponent(val)}`);
  };

  const handlePressEnter = () => {
    if (value.trim()) navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
  };

  return (
    <AutoComplete
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onChange={setValue}
      value={value}
      style={{ width: 360 }}
      dropdownStyle={{ borderRadius: 10 }}
    >
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        prefix={<SearchOutlined />}
        onPressEnter={handlePressEnter}
        style={{ borderRadius: 8 }}
      />
    </AutoComplete>
  );
};

export default SearchBar;
