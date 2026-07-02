export function isComponentAvailable(comp) {
  return Boolean(
    (comp.amazonInStock && comp.amazonPrice) ||
    (comp.cazasouqInStock && comp.cazasouqPrice) ||
    (comp.microlessInStock && comp.microlessPrice)
  );
}