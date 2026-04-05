import { useState } from "react";
import _ from "lodash";

const useAddressSearch = (debounceTime = 300) => {
  const [addressData, setAddressData] = useState([]);

  const handleAddressSearch = _.debounce(async (value) => {
    if (value) {
      const response = await fetch(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${value}&returnGeom=Y&getAddrDetails=Y&pageNum=`
      );
      const parseRes = await response.json();
      setAddressData(parseRes.results);
    }
  }, debounceTime);

  return { addressData, handleAddressSearch };
};

export default useAddressSearch;
