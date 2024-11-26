import React from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = TimePicker;

const TimeRangePicker = ({ value = [], onChange }) => {
  const formattedValues = value.length
    ? value.map((time) => dayjs(time, "HH:mm"))
    : [];

  const handleChange = (values) => {
    if (values) {
      onChange(formattedValues);
    } else {
      onChange([]);
    }
  };

  return (
    <RangePicker
      format="HH:mm"
      value={formattedValues}
      onChange={handleChange}
    />
  );
};

export default TimeRangePicker;
