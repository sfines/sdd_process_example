/**
 * Type declarations for react-window v1.8.11
 * The package includes types but TypeScript can't find them properly
 */

declare module 'react-window' {
  import * as React from 'react';

  export interface ListProps {
    children: React.ComponentType<{
      index: number;
      style: React.CSSProperties;
    }>;
    height: number | string;
    itemCount: number;
    itemSize: number;
    width?: number | string;
    onScroll?: (props: {
      scrollOffset: number;
      scrollUpdateWasRequested: boolean;
    }) => void;
    className?: string;
    ref?: React.Ref<FixedSizeList>;
  }

  export class FixedSizeList extends React.Component<ListProps> {
    scrollToItem(
      index: number,
      align?: 'start' | 'center' | 'end' | 'smart',
    ): void;
  }
}
