import type * as React from 'react'
export type ComponentType = React.FC<{ [key: string]: unknown } | undefined>

export interface GridAreaProps {
    left?: ComponentType;
    right?: ComponentType;
    header?: ComponentType;
    main?: ComponentType;
    footer?: ComponentType;
    side?: ComponentType;
    nav?: ComponentType
}

export interface ItemsAndDBRenderProps {
    item?: HouseKeyProps;
    items?: HouseKeyProps[];
    /** the rendered wrapping atom */
    Item?: ComponentType;
    /** the wrapping container */
    Container?: ComponentType;
    item_class?: string;
    container_class?: string;
    cell_class?: string;
    selected?: string | number;
}
export interface HandlerProps {
    handleClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

    /** the value changed — the new value, not the event */
    handleChange?: (value: unknown) => unknown;
    /** commit what is held */
    handleSave?: (value?: unknown) => unknown;
    /** send what is held onward — a query, a form, a composed thing */
    handleCancel?: (value?: unknown) => unknown;
    handleSubmit?: (value?: unknown) => unknown;
    /** dismiss me — the caller owns whether I exist */
    handleClose?: (value?: unknown) => unknown;
    /** open <-> closed, reporting the state it moved TO */
    handleToggle?: (is_open: boolean) => unknown;
    /** focus entered or left */
    handleFocus?: (is_focused: boolean) => unknown;
    handleSelect?: (value: unknown) => unknown;
    /** insert at the caret / at the current position */
    handleInsert?: (value: unknown) => unknown;
    /** remove one thing from a set */
    handleRemove?: (value: unknown) => unknown;
    /** wipe the set */
    handleClear?: (value?: unknown) => unknown;
    /** a range or scale changed — a patch zooms in, undefined zooms out */
    handleZoom?: (value?: unknown) => unknown;
    /** an item crossed from one zone into another (as opposed to reordering inside one) */
    handleTransfer?: (value?: unknown) => unknown;
    /** a thing was repositioned — geometry, not a DOM drag event */
    handleMove?: (value?: unknown) => unknown;
    handleDrag?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnter?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragLeave?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
    handleMouseEnter?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    handleMouseLeave?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    handleMouseMove?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    handleMouseUp?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    handleMouseDown?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export interface DOMElStates {
    /** this is used for selected items */
    is_active?: boolean;
    is_not_active?: boolean;
    is_hovered?: boolean;
    is_not_hovered?: boolean;
    is_selected?: boolean;
    is_filtered?: boolean;
    is_not_filtered?: boolean;
    is_not_selected?: boolean;
    is_visible?: boolean;
    is_not_visible?: boolean;
    is_fullscreen?: boolean;
    is_dragging?: boolean;
    is_not_dragging?: boolean;
    is_not_drag_over?: boolean;
    is_drag_over?: boolean;
    is_blocked?: boolean;
    is_disabled?: boolean;
    is_hidden?: boolean;
}

export interface ComponentProps {
    /** can you drag this item into another area */
    can_drag?: boolean;
    /** can this item be fullscreen */
    can_fullscreen?: boolean;
    /** can this item accept dropped items */
    can_drop?: boolean;
    /** does this item have a resizable feature */
    can_resize?: boolean;
    /** can this item be moved around like a window */
    can_move?: boolean;
    /** can this be drag-ordered */
    can_reorder?: boolean;
    /** does component need a grid wrapper? */
    has_wrapper?: boolean;
    
}

export interface HouseKeyProps {
    id?: number | string,
    label?: React.ReactNode | string,
    title?: React.ReactNode | string,
    color?: string;
    name?: React.ReactNode,
    description?: React.ReactNode,
    mark?: React.ReactNode,
    path?: string,
    View?: React.FC<{ [key: string]: unknown }>,
}

export interface UseURLProps {
    /** the position of the variable in the url based on string */
    slug?: string;
    /** the value of the variable in the url based on the slug */
    path?: string;
}

export interface UiProps extends ItemsAndDBRenderProps, GridAreaProps, HouseKeyProps, ComponentProps, DOMElStates, HandlerProps {
    className?: string
}