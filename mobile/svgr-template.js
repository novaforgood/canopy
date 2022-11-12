const template = (variables, { tpl }) => {
  return tpl`
  ${variables.imports};
  import { useTheme } from '@shopify/restyle';

  ${variables.interfaces};

  function Icon(props: SvgProps) {
    return (
      ${variables.jsx}
    );
  }
  
  type Color = string;
  type Props = Omit<SvgProps, "color"> & {
    color?: Color;
  };
  const ${variables.componentName} = ({ color, ...rest }: Props) => {
    const theme = useTheme();
    const realColor = theme.colors[color ?? "black"];  
    return <Icon color={realColor} {...rest} />;
  };

  ${variables.exports};
  `;
};

module.exports = template;
