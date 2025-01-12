import path from "path";

/**
 * Converts the given path to an absolute POSIX-style file path.
 * @param {string} value - The path to normalize and resolve.
 * @returns {string} - The absolute POSIX-style path.
 */
export function unknownToAbsolutePosixFilePath(value) {
  const normalizedPath = path.posix.normalize(value);
  return path.isAbsolute(normalizedPath) ? normalizedPath : path.posix.resolve(normalizedPath);
}

/**
 * Retrieves the current working directory (CWD).
 * Falls back to `/` if the working directory cannot be determined.
 * @returns {string} - The absolute POSIX-style CWD.
 */
export function getCwd() {
  try {
    const cwdValue = process.env.PWD || process.cwd() || "/";
    console.log("Debugging cwd.js: cwdValue =", cwdValue);
    return unknownToAbsolutePosixFilePath(cwdValue);
  } catch (error) {
    console.error("Debugging cwd.js: Error determining CWD:", error.message);
    console.error("Debugging cwd.js: Stack trace:", error.stack);
    return "/";
  }
}
