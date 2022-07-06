module.exports = (req, res, next) => {
    const validEmail = (email) => {
        let emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/
        let isRegexTrue = emailRegex.test(email)
        isRegexTrue ? next() : res.status(400).json({ message: 'mail non valide' });
    }
    validEmail(req.body.email)
  };