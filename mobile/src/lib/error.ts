export function handleError(e: any, description?: string) {
  if (description) {
    console.error(description, e);
  } else {
    console.error(e);
  }
}
