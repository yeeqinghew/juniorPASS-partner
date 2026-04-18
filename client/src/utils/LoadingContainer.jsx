import { Spin } from "antd";
import "./LoadingContainer.css";

/**
 * Reusable loading container component
 * @param {string} size - Spin size: 'small', 'default', 'large'
 * @param {string} tip - Optional loading text
 */
const LoadingContainer = ({ size = "large", tip = "", fullPage = false }) => {
  const className = fullPage
    ? "loading-container-fullpage"
    : "loading-container";

  return (
    <div className={className}>
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default LoadingContainer;