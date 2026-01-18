const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    next();
  } else {
    res.status(403).json({ message: "Teacher access only" });
  }
};

module.exports = { isTeacher };
