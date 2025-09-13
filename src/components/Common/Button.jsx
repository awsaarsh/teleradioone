// components/Common/Button.jsx
import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    danger: "btn-danger",
    warning: "btn-warning",
    info: "btn-info",
    light: "btn-light",
    dark: "btn-dark",
    outline: "btn-outline",
    ghost: "btn-ghost",
    link: "btn-link",
  };

  // Size classes
  const sizeClasses = {
    small: "btn-sm",
    medium: "btn-md",
    large: "btn-lg",
    xlarge: "btn-xl",
  };

  const baseClasses = "btn";
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "btn-full-width" : "",
    disabled || loading ? "btn-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    if (onClick) {
      onClick(event);
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <Loader2 size={16} className="btn-icon animate-spin" />;
    }
    if (icon) {
      return <span className="btn-icon">{icon}</span>;
    }
    return null;
  };

  return (
    <button
      type={type}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      {children && <span className="btn-text">{children}</span>}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
};

// Icon Button Component
export const IconButton = ({
  icon,
  size = "medium",
  variant = "ghost",
  disabled = false,
  loading = false,
  tooltip,
  onClick,
  className = "",
  ...props
}) => {
  const sizeClasses = {
    small: "icon-btn-sm",
    medium: "icon-btn-md",
    large: "icon-btn-lg",
  };

  const classes = [
    "icon-btn",
    sizeClasses[size],
    disabled || loading ? "btn-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      title={tooltip}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
    </button>
  );
};

// Button Group Component
export const ButtonGroup = ({
  children,
  size = "medium",
  variant = "primary",
  className = "",
  ...props
}) => {
  const classes = ["btn-group", `btn-group-${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            size,
            variant: child.props.variant || variant,
            key: index,
          });
        }
        return child;
      })}
    </div>
  );
};

export default Button;
