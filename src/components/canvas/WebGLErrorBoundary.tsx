'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { useExhibitionStore } from '../../store/useExhibitionStore';

export interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onWebGLFailure?: (errorMessage: string) => void;
}

export interface WebGLErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorMessage?: string | null;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorMessage: error.message || 'THREE.WebGLRenderer: A WebGL context could not be created.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[WebGLErrorBoundary] WebGL context initialization or canvas rendering crashed:', error.message, errorInfo);
    const notice =
      '3D hardware acceleration is unavailable on this device or browser (WebGL context could not be created). Automatically switched to the interactive 2D Floor Plan Directory.';
    try {
      const store = useExhibitionStore.getState();
      store.setWebglFallbackNotice(notice);
      store.setViewMode('2d');
    } catch (e) {
      console.warn('Store update warning:', e);
    }
    if (this.props.onWebGLFailure) {
      this.props.onWebGLFailure(notice);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return React.createElement(
          'div',
          { className: 'relative z-10 w-full h-full flex flex-col overflow-hidden bg-inherit' },
          React.createElement(
            'div',
            {
              className:
                'z-20 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-amber-200 text-xs sm:text-sm flex items-center justify-between gap-3 backdrop-blur-md',
            },
            React.createElement(
              'div',
              { className: 'flex items-center gap-2' },
              React.createElement('span', {
                className: 'inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0',
              }),
              React.createElement(
                'span',
                null,
                React.createElement('strong', null, '3D Canvas Notice: '),
                'WebGL hardware acceleration is unavailable or encountered an error. Switched to 2D Exhibition Grid.'
              )
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                onClick: () => this.setState({ hasError: false }),
                className:
                  'px-2.5 py-1 text-xs font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors cursor-pointer shrink-0',
              },
              'Retry 3D'
            )
          ),
          React.createElement(
            'div',
            { className: 'flex-1 w-full overflow-y-auto' },
            this.props.fallback
          )
        );
      }
      return null;
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;
