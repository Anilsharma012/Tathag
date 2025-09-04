exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const role = req.user.role;
    
    // Admin has all access
    if (role === "admin") return next();

    // Subadmin must have specific permission
    if (role === "subadmin") {
      if (req.user.permissions?.includes(permission)) {
        return next();
      } else {
        return res.status(403).json({ message: "Subadmin lacks permission." });
      }
    }

    return res.status(403).json({ message: "Access denied." });
  };
};
