/**
 * use recursive to check if press inside that component
 * @param target - this is childRef component
 * @param nestedViewRef - all of children element of childRef
 */
export const isTapInsideComponent = (
  target: any,
  nestedViewRef: any
): boolean => {
  if (
    target &&
    nestedViewRef &&
    target._nativeTag === nestedViewRef._nativeTag
  ) {
    return true;
  }

  if (nestedViewRef._children && nestedViewRef._children.length > 0) {
    for (let index = 0; index <= nestedViewRef._children.length - 1; index++) {
      if (isTapInsideComponent(target, nestedViewRef._children[index])) {
        return true;
      }
    }
  }

  return false;
};
