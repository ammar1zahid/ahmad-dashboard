// app/components/dashboard/auth/AdminOnly.jsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";

/**
 * AdminOnly
 * - children: nested elements (will be walked recursively)
 * - hide: if true, non-admins won't see the children at all
 *
 * Behavior:
 * - If user is admin -> render children unchanged
 * - If not admin and hide === true -> return null
 * - If not admin and hide === false -> recursively disable <button> elements,
 *   prevent <form> submissions, and add `.admin-disabled` class for styling.
 */
export default function AdminOnly({ children, hide = false }) {
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;

  if (!isAdmin && hide) return null;
  if (isAdmin) return <>{children}</>;

  // non-admin + hide === false -> render disabled/blocked UI
  function processElement(child) {
    // primitives (string/number) or null/undefined
    if (!React.isValidElement(child)) return child;

    // If it's a raw HTML element (type is string)
    const tagName = typeof child.type === "string" ? child.type : null;

    // disable native buttons
    if (tagName === "button") {
      return React.cloneElement(child, {
        disabled: true,
        title: child.props?.title || "Admin only",
        "aria-disabled": true,
        className: `${child.props?.className ?? ""} admin-disabled`.trim(),
      });
    }

    // prevent form submission and process its children
    if (tagName === "form") {
      const newChildren = React.Children.map(child.props.children, (c) => processElement(c));
      return React.cloneElement(child, {
        // onSubmit override prevents client-side submission
        onSubmit: (e) => {
          try { e.preventDefault(); e.stopPropagation(); } catch (err) {
            console.error('onSubmit error:', err);
          }
          // optional: show a tooltip or toast here if desired
        },
        action: undefined, // remove action to be safe
        className: `${child.props?.className ?? ""} admin-disabled`.trim(),
        children: newChildren,
      });
    }

    // For other elements (including Next <Link>), recursively process children
    const newChildren = React.Children.map(child.props?.children, (c) => processElement(c));
    if (newChildren === undefined) return child;
    return React.cloneElement(child, { children: newChildren });
  }

  const processed = React.Children.map(children, (c) => processElement(c));
  return <>{processed}</>;
}
