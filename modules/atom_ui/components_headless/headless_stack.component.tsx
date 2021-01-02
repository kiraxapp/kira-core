/// <reference types="../environment" />
import { StyleSheetController } from '../helpers/style_sheet_controller';
import { OneAtomCommonPropType } from '../prop_type';

interface HeadLessProps extends OneAtomCommonPropType {
  parentClassName: string;
  childClassName: string;
}
export type OneAtomHeadlessStackAxis = 'Vertical' | 'Horizontal';

export interface OneAtomHeadlessStackProps {
  spacing: number;
  axis: OneAtomHeadlessStackAxis;
  fluid: boolean;
}

interface InternalProps extends OneAtomHeadlessStackProps {
  children: (props: HeadLessProps) => JSX.Element;
}

const style_sheet_controller = new StyleSheetController();

export const HeadLessStack: FC<InternalProps> = function OneAtom_HeadlessStack({ axis, fluid, spacing, children }) {
  const half_spacing = spacing / 2;
  const base_str = `${spacing}_${fluid ? 'y' : 'n'}_${axis === 'Vertical' ? 'v' : 'h'}`;
  const parent_class_name = `p_${base_str}`;
  const child_class_name = `c_${base_str}`;

  if (axis === 'Vertical') {
    style_sheet_controller
      .addToRegister(
        `.${parent_class_name}`,
        `
          display: flex;
          ${fluid ? `height: calc(100% + ${spacing}px);` : ''}
          flex-direction: column;
          margin-top: -${half_spacing}px!important;
          margin-bottom: -${half_spacing}px!important;
        `,
      )
      .addToRegister(
        `.${child_class_name}`,
        `
          ${fluid ? `height: 100%;` : ''}
          margin-top: ${half_spacing}px!important;
          margin-bottom: ${half_spacing}px!important;
        `,
      );
  } else {
    style_sheet_controller
      .addToRegister(
        `.${parent_class_name}`,
        `
        display: flex;
        ${fluid ? `width: calc(100% + ${spacing}px);` : ''}
        flex-direction: row;
        margin-left: -${half_spacing}px!important;
        margin-right: -${half_spacing}px!important;
      `,
      )
      .addToRegister(
        `.${child_class_name}`,
        `
        ${fluid ? `width: 100%;` : ''}
        margin-left: ${half_spacing}px!important;
        margin-right: ${half_spacing}px!important;
      `,
      );
  }

  return children({
    parentClassName: parent_class_name,
    childClassName: child_class_name,
  });
};
