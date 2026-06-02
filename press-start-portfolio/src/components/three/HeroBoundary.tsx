"use client";
import { Component, type ReactNode } from "react";

/**
 * Catches any error thrown while rendering the WebGL hero (driver issues,
 * context-creation failure, postprocessing errors) and shows a static fallback
 * instead of crashing the whole page.
 */
export class HeroBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[hero] WebGL scene failed — showing static fallback.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
