/// <reference types="react/experimental" />
import { ViewTransition, type ReactNode } from "react";

/** Soft crossfade with a small upward slide between routes (animations in globals.css). */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
