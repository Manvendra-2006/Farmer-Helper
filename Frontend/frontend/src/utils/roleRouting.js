export function isOfficer(user) {
  return user?.role?.toLowerCase() === "officer";
}

export function hasDistrict(user) {
  return typeof user?.district === "string" && user.district.trim().length > 0;
}

export function homeRouteFor(user) {
  return isOfficer(user) && hasDistrict(user)
    ? "/command-center"
    : "/home";
}

export function officerRouteFor(user) {
  return isOfficer(user) && hasDistrict(user)
    ? "/command-center"
    : "/officer/select-district";
}