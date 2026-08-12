import { extname } from 'node:path'

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !extname(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context, nextResolve)
    } catch {
      // Let Node report the original resolution error for non-TypeScript imports.
    }
    try {
      return await nextResolve(`${specifier}/index.ts`, context, nextResolve)
    } catch {
      // Let Node report the original resolution error for missing directories.
    }
  }
  return nextResolve(specifier, context, nextResolve)
}
