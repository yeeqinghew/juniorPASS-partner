import { LoadingOutlined } from "@ant-design/icons";
import { Spin, Progress } from "antd";
import PropTypes from "prop-types";
import "./LoadingOverlay.css";

const LoadingOverlay = ({
  visible = false,
  status = "Loading...",
  progress = 0,
  showProgress = true,
}) => {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <div className="loading-overlay-status">{status}</div>
        {showProgress && (
          <Progress
            percent={progress}
            status="active"
            strokeColor={{
              "0%": "#98BDD2",
              "100%": "#6aa4c3",
            }}
            style={{ width: "300px", maxWidth: "80%" }}
          />
        )}
      </div>
    </div>
  );
};

LoadingOverlay.propTypes = {
  visible: PropTypes.bool,
  status: PropTypes.string,
  progress: PropTypes.number,
  showProgress: PropTypes.bool,
};

export default LoadingOverlay;
