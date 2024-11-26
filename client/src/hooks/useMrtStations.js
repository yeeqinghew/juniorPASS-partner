import { useState, useEffect } from "react";
import mrtData from "../data/mrt.json";
import LINE_COLORS from "../constant/mrtLineColors";
import { Tag } from "antd";

const useMRTStations = () => {
  const [mrtStations, setMRTStations] = useState({});

  const cleanMRTJSON = () => {
    const stations = {};
    mrtData.forEach((mrt) => {
      const stationName = mrt["Station Name"];
      const stationCode = mrt["Station"];

      if (stations[stationName]) {
        stations[stationName].push(stationCode);
      } else {
        stations[stationName] = [stationCode];
      }
    });
    setMRTStations(stations);
  };

  const renderTags = (stationCodes) => {
    return stationCodes.map((code) => {
      // Find matching color or use default
      const lineColor = Object.keys(LINE_COLORS).find((key) =>
        code.includes(key)
      );
      return (
        <Tag color={LINE_COLORS[lineColor] || "#000"} key={code}>
          {code}
        </Tag>
      );
    });
  };

  useEffect(() => {
    if (mrtData && mrtData.length > 0) {
      cleanMRTJSON();
    }
  }, [mrtData]);

  return { mrtStations, renderTags };
};

export default useMRTStations;
