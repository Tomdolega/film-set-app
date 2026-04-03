export function assertOrganizationRouteMatch(
  routeOrganizationId: string,
  resourceOrganizationId: string,
  resourceLabel: string,
): void {
  if (routeOrganizationId !== resourceOrganizationId) {
    throw new Error(`The requested ${resourceLabel} does not belong to this organization.`);
  }
}

export function assertProjectRouteMatch(
  routeProjectId: string,
  resourceProjectId: string,
  resourceLabel: string,
): void {
  if (routeProjectId !== resourceProjectId) {
    throw new Error(`The requested ${resourceLabel} does not belong to this project.`);
  }
}
