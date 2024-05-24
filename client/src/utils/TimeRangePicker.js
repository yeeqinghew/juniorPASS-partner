import React from "react";
import { TimePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = TimePicker;

const TimeRangePicker = (props) => {
  const handleChange = (values) => {
    console.log(values);
    if (values) {
      const formattedValues = values.map((value) => {
        return dayjs(value).format("HH:mm");
      });

      props.onChange(formattedValues);
    } else {
      props.onChange([]);
    }
  };

  return <RangePicker format="HH:mm" onChange={handleChange} />;
};

export default TimeRangePicker;
