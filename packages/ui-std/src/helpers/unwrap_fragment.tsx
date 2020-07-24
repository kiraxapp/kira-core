import React, { Fragment } from 'react';

export function unwrap_fragment(children: React.ReactNode): React.ReactElement[] {
  const child_arr = React.Children.toArray(children) as React.ReactElement[];

  const new_arr: React.ReactElement[] = child_arr.reduce<React.ReactElement[]>((builder, child) => {
    if (child.type === Fragment) {
      return builder.concat(unwrap_fragment(child.props.children));
    }

    builder.push(child);

    return builder;
  }, []);

  return new_arr;
}