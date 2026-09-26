import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { getTooltipPosition } from "./tooltipPosition";

const Tooltip = ({ children, content, side = "top", disabled = false }) => {
  const id = useId();
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const hide = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
  };

  const show = (delay = 220) => {
    if (disabled || !content) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const tooltip = tooltipRef.current?.getBoundingClientRect();
      if (!trigger || !tooltip) return;

      setPosition(getTooltipPosition({ trigger, tooltip, side }));
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, side]);

  if (!isValidElement(children)) return children;

  const trigger = cloneElement(children, {
    ref: triggerRef,
    "aria-describedby": open ? id : children.props["aria-describedby"],
    onMouseEnter: (event) => {
      children.props.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event) => {
      children.props.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event) => {
      children.props.onFocus?.(event);
      show(0);
    },
    onBlur: (event) => {
      children.props.onBlur?.(event);
      hide();
    },
    onClick: (event) => {
      children.props.onClick?.(event);
      hide();
    },
    onKeyDown: (event) => {
      children.props.onKeyDown?.(event);
      if (event.key === "Escape") hide();
    },
  });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <span
            ref={tooltipRef}
            id={id}
            role="tooltip"
            style={position || undefined}
            className={clsx(
              "pointer-events-none fixed z-[100] max-w-56 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-white shadow-lg",
              !position && "invisible",
            )}
          >
            <span
              aria-hidden="true"
              className={clsx("absolute size-2 rotate-45 bg-primary", {
                "-bottom-1 left-1/2 -translate-x-1/2": side === "top",
                "top-1/2 -left-1 -translate-y-1/2": side === "right",
                "-top-1 left-1/2 -translate-x-1/2": side === "bottom",
                "top-1/2 -right-1 -translate-y-1/2": side === "left",
              })}
            />
            <span className="relative">{content}</span>
          </span>,
          document.body,
        )}
    </>
  );
};

export default Tooltip;
