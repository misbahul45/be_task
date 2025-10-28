import env from "@/config/env";

export function versionedRoute(path: string) {
  return `/${env.appVersion}${path}`;
}

export async function errorHandler<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw error;
  }
}
