import { ConfigProvider } from "antd";
import React from "react";
import { Outlet } from "react-router-dom";

const PartnerLayout = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          // Seed Token
          colorPrimary: "#98BDD2",
          colorPrimaryActive: "#98BDD2",

          // Alias
          colorBgContainer: "#FCFBF8",
          fontSize: 14,
          fontFamily: "Poppins, sans-serif",
        },
        components: {
          Layout: {
            headerBg: "#FCFBF8",
            bodyBg: "#FCFBF8",
            headerHeight: 84,
            lightSiderBg: "#FCFBF8",
            siderBg: "#FCFBF8",
            triggerBg: "#98BDD2",
            lightTriggerBg: "#98BDD2",
            bodyBg: "#FCFBF8",
          },
          Menu: {
            horizontalItemSelectedColor: "#98BDD2",
          },
          Tabs: {
            itemActiveColor: "#98BDD2",
            itemHoverColor: "#98BDD2",
            itemSelectedColor: "#98BDD2",
            inkBarColor: "#98BDD2",
          },
        },
      }}
    >
      <div
        style={{
          backgroundColor: "#FCFBF8",
        }}
      >
        <Outlet />
      </div>
    </ConfigProvider>
  );
};

export default PartnerLayout;
