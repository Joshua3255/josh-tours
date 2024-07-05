module.exports = fn => {
  return (req, res, next) => {
    //  err => next(err)  == next   same meaning
    fn(req, res, next).catch(next);
  };
};
