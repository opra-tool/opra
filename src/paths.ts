/**
 * Takes a path to a file and returns its base name
 *
 * @param path Path to a file
 *
 * @example basePath('/file.html') // returns '/'
 * @example basePath('/path/to/file.html') // returns '/path/to/'
 */
export function basePath(path: string): string {
  return path.split('/').slice(0, -1).join('/');
}
