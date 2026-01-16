import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

// Tooltip.jsx
// Accessible, lightweight tooltip for React + Tailwind
// Exports default Tooltip component and a tiny Example component for quick testing.

function useOutsideEvents(ref, handler) {
  useEffect(() => {
    const onScroll = () => handler(false);
    const onResize = () => handler(false);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [ref, handler]);
}

const Tooltip = ({
  children,
  content,
  placement = "top", // top | right | bottom | left
  delay = 100, // ms
  offset = 8, // px
  className = "",
  showOnClick = false,
  portal = true,
  maxWidth = 240,
  id,
}) => {
  const triggerRef = useRef(null);
  const tipRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  // compute position
  const compute = () => {
    const trigger = triggerRef.current;
    const tip = tipRef.current;
    if (!trigger || !tip) return;

    const tr = trigger.getBoundingClientRect();
    const tt = tip.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;

    let top = 0;
    let left = 0;

    if (placement === "top") {
      top = tr.top + scrollY - tt.height - offset;
      left = tr.left + scrollX + tr.width / 2 - tt.width / 2;
    } else if (placement === "bottom") {
      top = tr.bottom + scrollY + offset;
      left = tr.left + scrollX + tr.width / 2 - tt.width / 2;
    } else if (placement === "left") {
      top = tr.top + scrollY + tr.height / 2 - tt.height / 2;
      left = tr.left + scrollX - tt.width - offset;
    } else if (placement === "right") {
      top = tr.top + scrollY + tr.height / 2 - tt.height / 2;
      left = tr.right + scrollX + offset;
    }

    // keep on screen horizontally
    const margin = 8;
    const docWidth = document.documentElement.clientWidth;
    if (left < margin) left = margin;
    if (left + tt.width > docWidth - margin) left = docWidth - tt.width - margin;

    setPosition({ top, left });
  };

  // show / hide with delay
  const handleShow = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => {
      setVisible(true);
      // compute next tick (tooltip DOM needs to render to measure)
      requestAnimationFrame(compute);
    }, delay);
  };
  const handleHide = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
    }, 50);
  };

  useOutsideEvents(triggerRef, () => {
    setVisible(false);
  });

  useEffect(() => {
    if (!visible) return;
    const onScroll = () => compute();
    const onResize = () => compute();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [visible, placement]);

  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  const tipNode = (
    <div
      ref={tipRef}
      role="tooltip"
      id={id}
      className={`pointer-events-none z-50 transform transition-all duration-150 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        maxWidth: maxWidth,
      }}
    >
      <div
        className={`select-none rounded-lg px-3 py-1.5 text-sm leading-none shadow-lg bg-slate-900 text-white ${className}`}
        style={{
          // little visual tweak to make arrow sit better
          transformOrigin: placement === "top" ? "bottom center" : placement === "bottom" ? "top center" : placement === "left" ? "right center" : "left center",
        }}
      >
        {content}
        {/* arrow */}
        <div
          className="absolute w-2 h-2 rotate-45 bg-slate-900"
          style={{
            // position the arrow depending on placement
            top: placement === "bottom" ? -6 : placement === "top" ? "auto" : "50%",
            bottom: placement === "top" ? -6 : "auto",
            left: placement === "left" ? "100%" : placement === "right" ? -6 : "50%",
            transform: placement === "left" || placement === "right" ? "translateY(-50%)" : "translateX(-50%)",
          }}
        />
      </div>
    </div>
  );

  const triggerProps = showOnClick
    ? {
        onClick: () => setVisible((v) => !v),
        onKeyDown: (e) => {
          if (e.key === "Escape") setVisible(false);
        },
      }
    : {
        onMouseEnter: handleShow,
        onFocus: handleShow,
        onMouseLeave: handleHide,
        onBlur: handleHide,
      };

  return (
    <>
      <span
        ref={triggerRef}
        {...triggerProps}
        aria-describedby={id}
        className="inline-flex"
        tabIndex={0}
      >
        {children}
      </span>

      {portal ? createPortal(tipNode, document.body) : tipNode}
    </>
  );
}

export default Tooltip;
