export function extractPropsAndEvents(vdom) {
  const { ...props } = vdom.props;
  const events = {};
  for (const [name, value] of Object.entries(props)) {
    if (name.startsWith("on:")) {
      events[name.substring(3)] = value;
      delete props[name];
    }
  }
  delete props.key;
  return { props, events };
}

export function extractClassAndSyle(props) {
  
}