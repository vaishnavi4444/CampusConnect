import * as authService from "../services/auth.js";

export const register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.json({ success: true, data, error: null });
  } catch (err) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
};

export const login = async (req, res) => {

  console.log("user: ", req.body)
  
  try {
    const data = await authService.loginUser(req.body);
    res.json({ success: true, data, error: null });
  } catch (err) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
};

export const me = async (req, res) => {
  try {
    const data = await authService.me(req);
    res.json({ success: true, data, error: null });
  } catch (err) {
    res.status(400).json({ success: false, data: null, error: err.message });
  }
};