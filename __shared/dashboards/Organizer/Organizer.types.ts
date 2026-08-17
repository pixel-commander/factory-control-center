export interface OrganizerProps {
  className?: string
  grid_type?: string
  nav_items?: [{
    id?: string | number,
    label?: string | React.ReactNode,
    title?: string | React.ReactNode,
    View?: React.FC<{ [key: string]: unknown  }>,
    color?: string,
    name?: React.ReactNode,
    description?: React.ReactNode,
  }],
  tabs?: [{
    id?: string | number,
    label?: string | React.ReactNode,
    title?: string | React.ReactNode,
    View?: React.FC<{ [key: string]: unknown  }>,
    color?: string,
    name?: React.ReactNode,
    description?: React.ReactNode,
  }]
}
