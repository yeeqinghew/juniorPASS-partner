import { Select } from "antd";
import { useState } from "react";

const SearchInput = (props) => {
  const { placeholder, addressValue, setAddressValue, style } = props;
  const [data, setData] = useState([]);

  const handleSearch = async (value) => {
    const response = await fetch(
      `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${value}&returnGeom=Y&getAddrDetails=Y&pageNum=`
    );
    const parseRes = await response.json();
    setData(parseRes.results);
  };

  const handleChange = (newValue, selectedGG) => {
    setAddressValue(selectedGG.valueObject);
  };

  return (
    <Select
      showSearch
      value={addressValue?.ADDRESS}
      placeholder={placeholder}
      style={style}
      defaultActiveFirstOption={false}
      suffixIcon={null}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      notFoundContent={null}
      options={(data || []).map((d) => ({
        value: d.ADDRESS,
        label: d.ADDRESS,
        valueObject: d,
      }))}
    />
  );
};

export default SearchInput;
